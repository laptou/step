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
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet that allows the page to know if the user has logged in. */
@WebServlet("/api/users/landing")
public class LandingServlet extends HttpServlet {
  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
    res.setContentType("text/html");

    StringBuilder content = new StringBuilder();

    content.append("<html><body>Close this window.<script type=\"text/javascript\">");

    if (req.getParameter("login") != null) {
      content.append("window.opener.dispatchEvent(new Event('auth-login'));");
    } else if (req.getParameter("logout") != null) {
      content.append("window.opener.dispatchEvent(new Event('auth-logout'));");
    } else {
      res.setStatus(400);
      return;
    }

    content.append("window.close();");
    content.append("</script></body></html>");
    res.getWriter().write(content.toString());
    res.setStatus(200);
  }
}
