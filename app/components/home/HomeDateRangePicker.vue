<script setup lang="ts">
import { DateFormatter, getLocalTimeZone, CalendarDate } from '@internationalized/date'
import type { Range } from '~/types'
import { monthsBackRange, thisMonthRange } from '~/utils/mimir'

const df = new DateFormatter('en-US', {
  dateStyle: 'medium'
})

const selected = defineModel<Range>({ required: true })

const ranges = [
  { label: 'This month', months: 1 },
  { label: 'Past 2 months', months: 2 },
  { label: 'Past 3 months', months: 3 },
  { label: 'Past 6 months', months: 6 },
  { label: 'Past year', months: 12 }
]

const toCalendarDate = (date: Date) => {
  return new CalendarDate(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  )
}

const calendarRange = computed({
  get: () => ({
    start: selected.value.start ? toCalendarDate(selected.value.start) : undefined,
    end: selected.value.end ? toCalendarDate(selected.value.end) : undefined
  }),
  set: (newValue: { start: CalendarDate | null, end: CalendarDate | null }) => {
    selected.value = {
      start: newValue.start ? newValue.start.toDate(getLocalTimeZone()) : new Date(),
      end: newValue.end ? newValue.end.toDate(getLocalTimeZone()) : new Date()
    }
  }
})

function presetRange(months: number): Range {
  return months === 1 ? thisMonthRange() : monthsBackRange(months)
}

const isRangeSelected = (range: { months: number }) => {
  if (!selected.value.start || !selected.value.end) return false

  const preset = presetRange(range.months)
  const selectedStart = toCalendarDate(selected.value.start)
  const selectedEnd = toCalendarDate(selected.value.end)
  const presetStart = toCalendarDate(preset.start)
  const presetEnd = toCalendarDate(preset.end)

  return selectedStart.compare(presetStart) === 0 && selectedEnd.compare(presetEnd) === 0
}

const selectRange = (range: { months: number }) => {
  selected.value = presetRange(range.months)
}
</script>

<template>
  <UPopover :content="{ align: 'start' }" :modal="true">
    <UButton
      color="neutral"
      variant="ghost"
      icon="i-lucide-calendar"
      class="data-[state=open]:bg-elevated group"
    >
      <span class="truncate">
        <template v-if="selected.start">
          <template v-if="selected.end">
            {{ df.format(selected.start) }} - {{ df.format(selected.end) }}
          </template>
          <template v-else>
            {{ df.format(selected.start) }}
          </template>
        </template>
        <template v-else>
          Pick a date
        </template>
      </span>

      <template #trailing>
        <UIcon name="i-lucide-chevron-down" class="shrink-0 text-dimmed size-5 group-data-[state=open]:rotate-180 transition-transform duration-200" />
      </template>
    </UButton>

    <template #content>
      <div class="flex items-stretch sm:divide-x divide-default">
        <div class="hidden sm:flex flex-col justify-center">
          <UButton
            v-for="(range, index) in ranges"
            :key="index"
            :label="range.label"
            color="neutral"
            variant="ghost"
            class="rounded-none px-4"
            :class="[isRangeSelected(range) ? 'bg-elevated' : 'hover:bg-elevated/50']"
            truncate
            @click="selectRange(range)"
          />
        </div>

        <UCalendar
          v-model="calendarRange"
          class="p-2"
          :number-of-months="2"
          range
        />
      </div>
    </template>
  </UPopover>
</template>
