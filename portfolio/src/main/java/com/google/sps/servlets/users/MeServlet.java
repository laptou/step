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

package com.google.sps.servlets.users;

import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.appengine.api.users.User;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.gson.JsonObject;

/** Servlet that returns comment information. */
@WebServlet("/api/users/me")
public class MeServlet extends HttpServlet {
  private static UserService userService = UserServiceFactory.getUserService();

  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
    res.setContentType("application/json");

    if (userService.isUserLoggedIn()) {
      User user = userService.getCurrentUser();

      JsonObject root = new JsonObject();
      root.addProperty("logoutUri", userService.createLogoutURL("/api/users/landing?logout"));
      root.addProperty("id", user.getUserId());
      root.addProperty("username", user.getNickname());
      root.addProperty("role", userService.isUserAdmin() ? "admin" : "user");

      res.setStatus(200);

      try (PrintWriter writer = res.getWriter()) {
        writer.write(root.toString());
        writer.flush();
      }
    } else {
      // tell them to log in
      JsonObject root = new JsonObject();
      root.addProperty("loginUri", userService.createLoginURL("/api/users/landing?login"));

      res.setStatus(401);

      try (PrintWriter writer = res.getWriter()) {
        writer.write(root.toString());
        writer.flush();
      }
    }

    res.flushBuffer();
  }
}
