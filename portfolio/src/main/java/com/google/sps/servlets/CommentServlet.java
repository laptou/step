// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
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
import java.util.ArrayList;

import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;

import com.google.gson.Gson;
import com.google.sps.data.Comment;

/** Servlet that returns comment information. */
@WebServlet("/api/comments")
@MultipartConfig
public class CommentServlet extends HttpServlet {
  private static Gson gson = new Gson();
  private static ArrayList<Comment> COMMENTS = new ArrayList<Comment>();

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String json = gson.toJson(COMMENTS);
    response.setContentType("application/json");
    response.getWriter().print(json);
  }

  /**
   * This route expects multipart form data, not url-encoded form data.
   */
  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    String username = readPartToString(req.getPart("username"));
    String content = readPartToString(req.getPart("content"));

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

    Comment comment = new Comment(COMMENTS.size(), username, username, content);
    COMMENTS.add(comment);
  }

  private static String readPartToString(Part part) throws IOException {
    InputStream src = part.getInputStream();
    ByteArrayOutputStream dst = new ByteArrayOutputStream();
    byte[] block = new byte[4096];

    while (true) {
      int bytesRead = src.read(block, 0, block.length);
      if (bytesRead < 0)
        break;
      dst.write(block, 0, bytesRead);
    }

    dst.flush();
    byte[] buf = dst.toByteArray();
    return new String(buf, StandardCharsets.UTF_8);
  }
}
