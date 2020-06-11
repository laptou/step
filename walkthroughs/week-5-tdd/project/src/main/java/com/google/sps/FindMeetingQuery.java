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

package com.google.sps;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Stack;

public final class FindMeetingQuery {
  private static class TimeSegment {
    public TimeRange range;
    public TimeSegment left;
    public TimeSegment right;

    public TimeSegment(TimeRange range) {
      this(range, null, null);
    }

    public TimeSegment(TimeRange range, TimeSegment left, TimeSegment right) {
      this.range = range;
      this.left = left;
      this.right = right;
    }

    @Override
    public String toString() {
      return "[ (" + range + ") " + left + " " + right + "]";
    }
  }

  public Collection<TimeRange> query(Collection<Event> events, MeetingRequest request) {
    TimeSegment root = new TimeSegment(TimeRange.WHOLE_DAY, null, null);

    System.out.printf("\nrequesting %d minute meeting\n", request.getDuration());
    for (Event event : events) {
      for (String attendee : event.getAttendees()) {
        if (request.getAttendees().contains(attendee)) {
          System.out.printf("splitting for %s\n", event.getWhen());
          // this is a blocker, split up the available time segment
          root = removeRange(root, event.getWhen(), request.getDuration());
          System.out.printf("new time range: %s\n", root);
        }
      }
    }

    // traverse time segments
    List<TimeRange> availableRanges = new ArrayList<>();
    Stack<TimeSegment> toProcess = new Stack<>();
    toProcess.push(root);

    while (!toProcess.isEmpty()) {
      TimeSegment seg = toProcess.pop();

      if (seg.left == null && seg.right == null && seg.range.duration() >= request.getDuration()) {
        availableRanges.add(seg.range);
        continue;
      }

      if (seg.left != null) {
        toProcess.push(seg.left);
      }

      if (seg.right != null) {
        toProcess.push(seg.right);
      }
    }

    return availableRanges;
  }

  private TimeSegment removeRange(TimeSegment segment, TimeRange toRemove, long minLength) {
    if (!segment.range.overlaps(toRemove))
      return segment;

    TimeRange baseRange = segment.range;
    boolean spaceAtStart = baseRange.start() < toRemove.start();
    boolean spaceAtEnd = baseRange.end() > toRemove.end();

    if (segment.left != null) {
      TimeSegment newLeft = removeRange(segment.left, toRemove, minLength);
      segment = new TimeSegment(baseRange, newLeft, segment.right);
    } else if (spaceAtStart) {

      if (baseRange.end() < toRemove.end()) {

      }
      TimeRange splitRange = TimeRange.fromStartEnd(baseRange.start(), toRemove.start(), false);
      if (segment.right != null)
        segment = new TimeSegment(baseRange, new TimeSegment(splitRange), segment.right);
      else
        segment = new TimeSegment(splitRange, null, null);
    } else {
      TimeRange clippedRange = TimeRange.fromStartEnd(toRemove.end(), baseRange.end(), false);
      segment = new TimeSegment(clippedRange, null, segment.right);
    }

    if (segment.right != null) {
      TimeSegment newRight = removeRange(segment.right, toRemove, minLength);
      segment = new TimeSegment(baseRange, segment.left, newRight);
    } else if (baseRange.end() > toRemove.end()) {
      TimeRange splitRange = TimeRange.fromStartEnd(toRemove.end(), baseRange.end(), false);
      if (segment.left != null)
        segment = new TimeSegment(baseRange, segment.left, new TimeSegment(splitRange));
      else
        segment = new TimeSegment(splitRange, null, null);
    } else {
      TimeRange clippedRange = TimeRange.fromStartEnd(baseRange.start(), toRemove.start(), false);
      segment = new TimeSegment(clippedRange, segment.left, null);
    }

    return segment;
  }
}
