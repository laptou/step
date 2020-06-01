package com.google.sps.data;

public class Comment {
  public final long id;
  public final String name;
  public final String user;
  public final String content;
  public long upvotes;
  public long downvotes;

  public Comment(long id, String name, String user, String content) {
    this.id = id;
    this.name = name;
    this.user = user;
    this.content = content;
  }
}
