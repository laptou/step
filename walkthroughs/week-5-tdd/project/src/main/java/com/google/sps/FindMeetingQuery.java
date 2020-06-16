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
import java.util.List;
import java.util.SortedSet;
import java.util.TreeSet;

public final class FindMeetingQuery {
  public Collection<TimeRange> query(Collection<Event> events, MeetingRequest request) {
    if (request.getDuration() > 1440)
      return Collections.emptyList();

    boolean hasMandatoryAttendees = false;
    boolean hasOptionalAttendees = false;

    // TreeSet has O(log n) insertion time
    SortedSet<TimeRange> mandatoryBlockers = new TreeSet<>(TimeRange.ORDER_BY_START);
    SortedSet<TimeRange> optionalBlockers = new TreeSet<>(TimeRange.ORDER_BY_START);

    // which makes this loop an O(n log n) operation
    events: for (Event event : events) {
      for (String attendee : event.getAttendees()) {
        if (request.getAttendees().contains(attendee)) {
          hasMandatoryAttendees = true;
          mandatoryBlockers.add(event.getWhen());
          optionalBlockers.add(event.getWhen());
          continue events;
        }

        if (request.getOptionalAttendees().contains(attendee)) {
          hasOptionalAttendees = true;
          optionalBlockers.add(event.getWhen());
          continue events;
        }
      }
    }

    // mergeTimeRanges is O(n)
    List<TimeRange> combinedMandatoryBlockers = mergeTimeRanges(mandatoryBlockers);
    List<TimeRange> combinedOptionalBlockers = mergeTimeRanges(optionalBlockers);

    if (!hasOptionalAttendees)
      return findAvailability(combinedMandatoryBlockers, request.getDuration());

    if (!hasMandatoryAttendees)
      return Arrays.asList(TimeRange.WHOLE_DAY);

    List<TimeRange> availableRangesWithOptionalAttendees =
        findAvailability(combinedOptionalBlockers, request.getDuration());

    if (availableRangesWithOptionalAttendees.size() > 0)
      return availableRangesWithOptionalAttendees;

    return findAvailability(combinedMandatoryBlockers, request.getDuration());
  }

  private static List<TimeRange> mergeTimeRanges(Collection<TimeRange> ranges) {
    List<TimeRange> merged = new ArrayList<>(ranges.size());
    TimeRange prev = null;

    for (TimeRange current : ranges) {
      // first range should always be added
      if (prev == null) {
        prev = current;
        merged.add(prev);
        continue;
      }

      // if the previous range overlaps the current range, extend it
      if (prev.end() > current.start()) {
        if (current.end() > prev.end()) {
          prev = TimeRange.fromStartEnd(prev.start(), current.end(), false);
          merged.set(merged.size() - 1, prev);
        }
      } else {
        // otherwise, just add it
        prev = current;
        merged.add(prev);
      }
    }

    return merged;
  }

  /**
   * Subtracts the time ranges given by `ranges` from the time ranges representing the whole day.
   * `ranges` must be sorted by start time and not contain any overlapping ranges. Any remaining
   * time ranges shorter than `minGapLength` will be ignored.
   */
  private static List<TimeRange> findAvailability(List<TimeRange> ranges, long minGapLength) {
    List<TimeRange> availableRanges = new ArrayList<>(ranges.size());

    if (ranges.size() == 0) {
      availableRanges.add(TimeRange.WHOLE_DAY);
      return availableRanges;
    }

    TimeRange prev = null;
    for (int i = 0; i <= ranges.size(); i++) {
      TimeRange current = i < ranges.size() ? ranges.get(i) : null;

      int start = prev == null ? TimeRange.START_OF_DAY : prev.end();
      int end = current == null ? TimeRange.END_OF_DAY : current.start();
      // END_OF_DAY is actually 1 minute before the end
      boolean inclusive = current == null;

      TimeRange gap = TimeRange.fromStartEnd(start, end, inclusive);

      if (gap.duration() >= minGapLength)
        availableRanges.add(gap);

      prev = current;
    }

    return availableRanges;
  }
}
