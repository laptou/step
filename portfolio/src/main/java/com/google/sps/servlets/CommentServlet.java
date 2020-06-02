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

package com.google.sps.servlets;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
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
import com.google.appengine.api.datastore.QueryResultList;
import com.google.appengine.api.datastore.Text;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.sps.data.Comment;

/** Servlet that returns comment information. */
@WebServlet("/api/comments")
@MultipartConfig
public class CommentServlet extends HttpServlet {
  private static Gson gson = new Gson();
  private static DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
  private static Pattern htmlDetector =
      Pattern.compile("<\\w+(\\s*\\w+\\s*(=\\s*['\"].*['\"]))*>.*<\\/\\w+>", Pattern.DOTALL);

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    Query query = new Query("Comment").addSort("timestamp", SortDirection.DESCENDING);

    FetchOptions fetchOptions;

    if (request.getParameter("limit") != null) {
      int limit;
      try {
        limit = Integer.parseInt(request.getParameter("limit"));
      } catch (NumberFormatException ex) {
        response.setStatus(400);
        return;
      }

      fetchOptions = FetchOptions.Builder.withLimit(Math.min(limit, 50));
    } else {
      fetchOptions = FetchOptions.Builder.withLimit(20);
    }

    if (request.getParameter("cursor") != null) {
      Cursor start;
      try {
        start = Cursor.fromWebSafeString(request.getParameter("cursor"));
      } catch (IllegalArgumentException ex) {
        response.setStatus(400);
        return;
      }

      fetchOptions.startCursor(start);
    }

    QueryResultList<Entity> results = datastore.prepare(query).asQueryResultList(fetchOptions);

    List<Comment> comments = results.stream().map(e -> {
      long id = e.getKey().getId();
      String username = (String) e.getProperty("username");
      String name = (String) e.getProperty("name");
      String content = ((Text) e.getProperty("content")).getValue();
      boolean shameful = (boolean) e.getProperty("shameful");
      return new Comment(id, username, name, content, shameful);
    }).collect(Collectors.toList());

    JsonObject root = new JsonObject();
    root.add("comments", gson.toJsonTree(comments));
    root.addProperty("next", results.getCursor().toWebSafeString());
    
    response.setContentType("application/json");
    response.getWriter().print(root.toString());
  }

  /**
   * This route expects multipart form data, not url-encoded form data.
   */
  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse resp)
      throws ServletException, IOException {
    Part usernamePart, contentPart;

    try {
      usernamePart = req.getPart("username");
      contentPart = req.getPart("content");
    } catch (ServletException e) {
      resp.setStatus(400);
      return;
    } catch (Error e) {
      resp.setStatus(500);
      return;
    }

    // truncate usernames at 1000 bytes
    String username = readPartToString(usernamePart, 1000);

    // truncate comments at 50000 bytes
    String content = readPartToString(contentPart, 50000);

    if (username.length() == 0) {
      resp.setStatus(400);
      resp.getWriter().print("username");
      return;
    }

    if (content.length() == 0) {
      resp.setStatus(400);
      resp.getWriter().print("content");
      return;
    }

    Entity comment = new Entity("Comment");
    comment.setProperty("timestamp", new Date());
    comment.setProperty("username", username);
    comment.setProperty("name", username);

    // allow storing values more than 1500 bytes long
    comment.setUnindexedProperty("content", new Text(content));
    comment.setProperty("shameful",
        htmlDetector.matcher(username).matches() || htmlDetector.matcher(content).matches());
    comment.setProperty("upvotes", 0);
    comment.setProperty("downvotes", 0);
    datastore.put(comment);
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
