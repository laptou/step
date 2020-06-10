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

import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.EntityNotFoundException;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.CompositeFilterOperator;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

/**
 * Serlvet that allows user to vote on comments. Last segment of path should be the comment ID.
 */
@WebServlet("/api/vote/*")
@MultipartConfig
public class VoteServlet extends HttpServlet {
  private static Gson gson = new Gson();
  private static UserService users = UserServiceFactory.getUserService();
  private static DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

  public static class VotePostInfo {
    public final VoteKind kind;

    public VotePostInfo(VoteKind kind) {
      this.kind = kind;
    }
  }

  protected void doGet(HttpServletRequest req, HttpServletResponse res)
      throws ServletException, IOException {
    long commentId;
    Entity commentEnt;
    try {
      // skip leading forward slash
      commentId = Long.parseLong(req.getPathInfo().substring(1));
      commentEnt = datastore.get(KeyFactory.createKey("Comment", commentId));
    } catch (NumberFormatException e) {
      res.setStatus(404);
      return;
    } catch (EntityNotFoundException e) {
      res.setStatus(404);
      return;
    }

    JsonObject root = new JsonObject();
    root.addProperty("upvotes", (long) commentEnt.getProperty("upvotes"));
    root.addProperty("downvotes", (long) commentEnt.getProperty("downvotes"));

    res.setContentType("application/json");
    res.getWriter().write(root.toString());
  }

  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse res)
      throws ServletException, IOException {
    if (!users.isUserLoggedIn()) {
      res.setStatus(401);
      return;
    }

    String userId = users.getCurrentUser().getUserId();

    long commentId;
    try {
      // skip leading forward slash
      commentId = Long.parseLong(req.getPathInfo().substring(1));
    } catch (NumberFormatException e) {
      res.setStatus(404);
      return;
    }

    VotePostInfo info;
    try {
      info = gson.fromJson(req.getReader(), VotePostInfo.class);
      if (info.kind == null)
        throw new IllegalArgumentException();
    } catch (Throwable e) {
      res.setStatus(400);
      return;
    }

    Entity commentEnt;
    try {
      commentEnt = datastore.get(KeyFactory.createKey("Comment", commentId));
    } catch (EntityNotFoundException e) {
      res.setStatus(404);
      return;
    }

    Query q = new Query("Vote").setFilter(CompositeFilterOperator.and(
        new Query.FilterPredicate("commentId", FilterOperator.EQUAL, commentId),
        new Query.FilterPredicate("userId", FilterOperator.EQUAL, userId)));
    PreparedQuery pq = datastore.prepare(q);

    Entity voteEnt = pq.asSingleEntity();


    if (voteEnt == null) {
      // we are committing a new vote
      voteEnt = new Entity("Vote");
      voteEnt.setIndexedProperty("commentId", commentId);
      voteEnt.setIndexedProperty("userId", userId);
    } else {
      // we are changing an existing vote, remove the old one
      switch (VoteKind.valueOf((String) voteEnt.getProperty("kind"))) {
        case DOWN:
          commentEnt.setProperty("downvotes", (long) commentEnt.getProperty("downvotes") - 1);
          break;
        case UP:
          commentEnt.setProperty("upvotes", (long) commentEnt.getProperty("upvotes") - 1);
          break;
        default:
          break;

      }
    }

    switch (info.kind) {
      case DOWN:
        commentEnt.setProperty("downvotes", (long) commentEnt.getProperty("downvotes") + 1);
        break;
      case UP:
        commentEnt.setProperty("upvotes", (long) commentEnt.getProperty("upvotes") + 1);
        break;
      default:
        break;
    }

    voteEnt.setIndexedProperty("kind", info.kind.toString());
    datastore.put(voteEnt);
    datastore.put(commentEnt);
  }
}
