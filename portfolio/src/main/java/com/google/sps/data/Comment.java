package com.google.sps.data;

import java.util.Date;

public class Comment {
  public final long id;
  public final Date date;
  public final String name;
  public final String user;
  public final String content;
  /**
   * A comment is shameful if it appears to contain HTML. Shame on you, for trying to do XSS on my
   * website!
   */
  public final boolean shameful;
  public final long upvotes;
  public final long downvotes;

  public Comment(long id, String name, String user, String content, boolean shameful, long upvotes,
      long downvotes) {
    this.id = id;
    this.date = new Date();
    this.name = name;
    this.user = user;
    this.content = content;
    this.shameful = shameful;

    this.upvotes = upvotes;
    this.downvotes = downvotes;
  }
}
