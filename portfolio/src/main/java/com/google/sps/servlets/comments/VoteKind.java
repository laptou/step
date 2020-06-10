package com.google.sps.servlets.comments;

import com.google.gson.annotations.SerializedName;

public enum VoteKind {
  @SerializedName("up") UP,
  @SerializedName("down") DOWN
}
