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
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

public final class FindMeetingQuery {
  private static class TimeSegment {
    public final TimeRange range;
    public final TimeSegment left;
    public final TimeSegment right;

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

    for (Event event : events) {
      for (String attendee : event.getAttendees()) {
        if (request.getAttendees().contains(attendee)) {
          // this is a blocker, split up the available time segment
          root = removeRange(root, event.getWhen());
        }
      }
    }

    // traverse time segments
    List<TimeRange> availableRanges = new ArrayList<>();
    Queue<TimeSegment> toProcess = new LinkedList<>();
    toProcess.add(root);

    while (!toProcess.isEmpty()) {
      TimeSegment seg = toProcess.poll();

      if (seg.left == null && seg.right == null && seg.range.duration() >= request.getDuration()) {
        availableRanges.add(seg.range);
        continue;
      }

      if (seg.left != null) {
        toProcess.add(seg.left);
      }

      if (seg.right != null) {
        toProcess.add(seg.right);
      }
    }

    return availableRanges;
  }

  /**
   * Removes the range `toRemove` from the segment `segment`, splitting it if necessary.
   */
  private TimeSegment removeRange(TimeSegment segment, TimeRange toRemove) {
    if (!segment.range.overlaps(toRemove))
      return segment;

    TimeRange baseRange = segment.range;
    boolean hasChild = false;

    if (segment.left != null) {
      TimeSegment newLeft = removeRange(segment.left, toRemove);
      segment = new TimeSegment(baseRange, newLeft, segment.right);
      hasChild = true;
    } 

    if (segment.right != null) {
      TimeSegment newRight = removeRange(segment.right, toRemove);
      segment = new TimeSegment(baseRange, segment.left, newRight);
      hasChild = true;
    } 

    if (hasChild) {
      return segment;
    }

    boolean spaceAtStart = baseRange.start() < toRemove.start();
    boolean spaceAtEnd = baseRange.end() > toRemove.end();

    if (!spaceAtStart && !spaceAtEnd) {
      return null;
    }
    
    if (spaceAtStart && !spaceAtEnd) {
      TimeRange newRange = TimeRange.fromStartEnd(baseRange.start(), toRemove.start(), false);
      return new TimeSegment(newRange, segment.left, segment.right);
    }

    if (!spaceAtStart && spaceAtEnd) {
      TimeRange newRange = TimeRange.fromStartEnd(toRemove.end(), baseRange.end(), false);
      return new TimeSegment(newRange, segment.left, segment.right);
    }

    TimeRange newLeft = TimeRange.fromStartEnd(baseRange.start(), toRemove.start(), false);
    TimeRange newRight = TimeRange.fromStartEnd(toRemove.end(), baseRange.end(), false);
    return new TimeSegment(baseRange, new TimeSegment(newLeft), new TimeSegment(newRight));
  }
}
