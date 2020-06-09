// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package com.google.sps.servlets.comments;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.regex.Pattern;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import com.google.appengine.api.datastore.Cursor;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.cloud.translate.Translate;
import com.google.cloud.translate.TranslateOptions;
import com.google.cloud.translate.Translation;
import com.google.cloud.translate.Translate.TranslateOption;
import com.google.appengine.api.datastore.QueryResultList;
import com.google.appengine.api.datastore.Text;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

/** Servlet that returns comment information. */
@WebServlet("/api/comments")
@MultipartConfig
public class CommentServlet extends HttpServlet {
  private static DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
  private static UserService users = UserServiceFactory.getUserService();
  private static Translate translate = TranslateOptions.getDefaultInstance().getService();
  private static Pattern htmlDetector =
      Pattern.compile("<\\w+(\\s*\\w+\\s*(=\\s*['\"].*['\"]))*>.*<\\/\\w+>", Pattern.DOTALL);

  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
    Query query = new Query("Comment").addSort("timestamp", SortDirection.DESCENDING);

    FetchOptions fetchOptions;

    if (req.getParameter("limit") != null) {
      int limit;
      try {
        limit = Integer.parseInt(req.getParameter("limit"));
      } catch (NumberFormatException ex) {
        res.setStatus(400);
        return;
      }

      fetchOptions = FetchOptions.Builder.withLimit(Math.min(limit, 50));
    } else {
      fetchOptions = FetchOptions.Builder.withLimit(20);
    }

    if (req.getParameter("cursor") != null) {
      Cursor start;
      try {
        start = Cursor.fromWebSafeString(req.getParameter("cursor"));
      } catch (IllegalArgumentException ex) {
        res.setStatus(400);
        return;
      }

      fetchOptions.startCursor(start);
    }

    QueryResultList<Entity> results = datastore.prepare(query).asQueryResultList(fetchOptions);

    JsonObject root = new JsonObject();
    JsonArray comments = new JsonArray();

    results.stream().forEach(ent -> {
      JsonObject comment = new JsonObject();
      comment.addProperty("id", ent.getKey().getId());
      comment.addProperty("name", (String) ent.getProperty("name"));
      comment.addProperty("content", ((Text) ent.getProperty("content")).getValue());

      if (ent.hasProperty("contentLang")) {
        comment.addProperty("contentLang", (String) ent.getProperty("contentLang"));
        comment.addProperty("contentTranslated",
            ((Text) ent.getProperty("contentTranslated")).getValue());
      }

      comment.addProperty("shameful", (boolean) ent.getProperty("shameful"));
      comment.addProperty("upvotes", (long) ent.getProperty("upvotes"));
      comment.addProperty("downvotes", (long) ent.getProperty("downvotes"));
      comments.add(comment);
    });

    root.add("comments", comments);
    root.addProperty("nextCommentCursor", results.getCursor().toWebSafeString());

    res.setContentType("application/json");
    res.setStatus(200);
    res.getWriter().print(root.toString());
  }

  /**
   * This route expects multipart form data, not url-encoded form data.
   */
  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse res)
      throws ServletException, IOException {
    Part namePart, contentPart;

    try {
      namePart = req.getPart("name");
      contentPart = req.getPart("content");
    } catch (ServletException e) {
      res.setStatus(400);
      return;
    } catch (Error e) {
      res.setStatus(500);
      return;
    }

    // truncate usernames at 1000 bytes
    String name = readPartToString(namePart, 1000);

    // truncate comments at 50000 bytes
    String content = readPartToString(contentPart, 50000);

    if (name.length() == 0) {
      res.setStatus(400);
      res.getWriter().print("name");
      return;
    }

    if (content.length() == 0) {
      res.setStatus(400);
      res.getWriter().print("content");
      return;
    }



    Entity comment = new Entity("Comment");
    comment.setProperty("timestamp", new Date());
    comment.setProperty("user", users.isUserLoggedIn() ? users.getCurrentUser().getUserId() : null);
    comment.setProperty("name", name);

    Translation translation = translate.translate(content, TranslateOption.targetLanguage("en"),
        TranslateOption.model("nmt"));

    if (translation.getSourceLanguage() != "en") {
      comment.setUnindexedProperty("contentTranslated", new Text(translation.getTranslatedText()));
      comment.setProperty("contentLang", translation.getSourceLanguage());
    }

    comment.setUnindexedProperty("content", new Text(content));
    comment.setProperty("shameful",
        htmlDetector.matcher(name).matches() || htmlDetector.matcher(content).matches());
    comment.setProperty("upvotes", 0);
    comment.setProperty("downvotes", 0);
    datastore.put(comment);

    res.setStatus(200);
  }

  private static String readPartToString(Part part, int limit) throws IOException {
    InputStream src = part.getInputStream();
    ByteArrayOutputStream dst = new ByteArrayOutputStream();
    byte[] block = new byte[1024];

    while (dst.size() < limit) {
      int bytesRead = src.read(block, 0, Math.min(block.length, limit - dst.size()));
      if (bytesRead < 0)
        break;
      dst.write(block, 0, bytesRead);
    }

    dst.flush();
    byte[] buf = dst.toByteArray();
    return new String(buf, StandardCharsets.UTF_8);
  }
}
