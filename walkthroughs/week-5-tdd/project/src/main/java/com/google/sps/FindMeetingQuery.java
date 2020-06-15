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
import java.util.Collections;
import java.util.List;
import java.util.SortedSet;
import java.util.TreeSet;

public final class FindMeetingQuery {
  public Collection<TimeRange> query(Collection<Event> events, MeetingRequest request) {
    if (request.getDuration() > 1440)
      return Collections.emptyList();

    SortedSet<TimeRange> mandatoryBlockers = new TreeSet<>(TimeRange.ORDER_BY_START);

    for (Event event : events) {
      for (String attendee : event.getAttendees()) {
        if (request.getAttendees().contains(attendee)) {
          // this is a blocker, split up the available time segment
          mandatoryBlockers.add(event.getWhen());
        }
      }
    }

    List<TimeRange> combinedMandatoryBlockers = new ArrayList<>(mandatoryBlockers.size());

    {
      TimeRange prev = null;

      for (TimeRange current : mandatoryBlockers) {
        if (prev == null) {
          prev = current;
          combinedMandatoryBlockers.add(prev);
          continue;
        }

        if (prev.end() > current.start()) {
          if (current.end() > prev.end()) {
            prev = TimeRange.fromStartEnd(prev.start(), current.end(), false);
            combinedMandatoryBlockers.set(combinedMandatoryBlockers.size() - 1, prev);
          }
        } else {
          prev = current;
          combinedMandatoryBlockers.add(prev);
        }
      }
    }

    // traverse time segments
    List<TimeRange> availableRanges = new ArrayList<>();

    if (combinedMandatoryBlockers.size() == 0) {
      availableRanges.add(TimeRange.WHOLE_DAY);
      return availableRanges;
    }

    {
      TimeRange prev = null;
      for (int i = 0; i <= combinedMandatoryBlockers.size(); i++) {
        TimeRange current =
            i < combinedMandatoryBlockers.size() ? combinedMandatoryBlockers.get(i) : null;

        int start = prev == null ? TimeRange.START_OF_DAY : prev.end();
        int end = current == null ? TimeRange.END_OF_DAY : current.start();
        // END_OF_DAY is actually 1 minute before the end b/c whoever wrote this hates me
        boolean inclusive = current == null;

        TimeRange gap = TimeRange.fromStartEnd(start, end, inclusive);

        if (gap.duration() >= request.getDuration())
          availableRanges.add(gap);

        prev = current;
      }
    }

    return availableRanges;
  }
}
