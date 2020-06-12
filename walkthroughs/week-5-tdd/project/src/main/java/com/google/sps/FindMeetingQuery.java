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
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

public final class FindMeetingQuery {
  private static class TimeTree {
    public final TimeRange range;
    public final TimeTree left;
    public final TimeTree right;

    public TimeTree(TimeRange range) {
      this(range, null, null);
    }

    public TimeTree(TimeRange range, TimeTree left, TimeTree right) {
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
    if (request.getDuration() > 1440)
      return Collections.emptyList();

    TimeTree root = new TimeTree(TimeRange.WHOLE_DAY, null, null);

    boolean hasOptionalAttendees = !request.getOptionalAttendees().isEmpty();
    boolean hasRequiredAttendees = !request.getAttendees().isEmpty();

    if (!hasOptionalAttendees && !hasRequiredAttendees) {
      return Arrays.asList(root.range);
    }

    TimeTree optionalRoot = hasOptionalAttendees ? root : null;

    for (Event event : events) {
      for (String attendee : event.getAttendees()) {
        TimeRange blocked = event.getWhen();
        int buffer = (int) request.getDuration();

        if (request.getAttendees().contains(attendee)) {
          // this is a blocker, split up the available time segment
          root = removeRange(root, blocked, buffer);
          optionalRoot = removeRange(optionalRoot, blocked, buffer);
        }

        if (request.getOptionalAttendees().contains(attendee)) {
          optionalRoot = removeRange(optionalRoot, blocked, buffer);
        }
      }
    }

    // traverse time segments
    List<TimeRange> availableRanges = new ArrayList<>();
    Queue<TimeTree> toProcess = new LinkedList<>();

    // if anything remained while including optional attendees, get them
    if (hasOptionalAttendees && optionalRoot != null) {
      toProcess.add(optionalRoot);
    } else if (hasRequiredAttendees && root != null) {
      toProcess.add(root);
    }
    while (!toProcess.isEmpty()) {
      TimeTree seg = toProcess.poll();

      // extend the blocked zone forwards by the duration of the request
      if (seg.left == null && seg.right == null) {
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
  private TimeTree removeRange(TimeTree segment, TimeRange toRemove, long buffer) {
    if (segment == null || !segment.range.overlaps(toRemove))
      return segment;

    TimeRange baseRange = segment.range;
    boolean spaceAtStart = baseRange.start() <= toRemove.start() - buffer;
    boolean spaceAtEnd = baseRange.end() >= toRemove.end() + buffer;

    // we can perform this check early
    if (!spaceAtStart && !spaceAtEnd)
      return null;

    // otherwise, what we should do depends on whether this node already has children

    boolean hasChild = false;

    if (segment.left != null) {
      TimeTree newLeft = removeRange(segment.left, toRemove, buffer);
      hasChild = newLeft != null;
      segment = new TimeTree(baseRange, newLeft, segment.right);
    }

    if (segment.right != null) {
      TimeTree newRight = removeRange(segment.right, toRemove, buffer);
      hasChild = hasChild || newRight != null;
      segment = new TimeTree(baseRange, segment.left, newRight);
    }

    if (hasChild) {
      return segment;
    }

    if (spaceAtStart && !spaceAtEnd) {
      TimeRange newRange = TimeRange.fromStartEnd(baseRange.start(), toRemove.start(), false);
      return new TimeTree(newRange, segment.left, segment.right);
    }

    if (!spaceAtStart && spaceAtEnd) {
      TimeRange newRange = TimeRange.fromStartEnd(toRemove.end(), baseRange.end(), false);
      return new TimeTree(newRange, segment.left, segment.right);
    }

    TimeRange newLeft = TimeRange.fromStartEnd(baseRange.start(), toRemove.start(), false);
    TimeRange newRight = TimeRange.fromStartEnd(toRemove.end(), baseRange.end(), false);
    return new TimeTree(baseRange, new TimeTree(newLeft), new TimeTree(newRight));
  }
}
