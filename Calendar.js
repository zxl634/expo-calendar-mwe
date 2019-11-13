import React from "react"
import { Platform } from "react-native"
import * as Calendar from 'expo-calendar';
import * as Permissions from 'expo-permissions';

export function MyCalendar () {
  const [firstRun, setFirstRun] = React.useState(true)
  async function checkPermission () {
    console.log("Checking permissions")
    const { status } = await Permissions.getAsync(
      Permissions.CALENDAR,
    );
    if (status !== 'granted') {
      console.log("Permissions not granted")
      return false
    } else {
      console.log("Permissions granted")
      return true
    }
  }
  async function getCalendars () {
    return Calendar.getCalendarsAsync()
  }
  async function createTD2Calendar (sourceId) {
    return Calendar.createCalendarAsync({
      "title": "TD2",
      "color": "#1BADF8",
      "entityType": "event",
      "sourceId": sourceId,
    })
  }
  async function askPermission () {
    const { status } = await Permissions.askAsync(Permissions.CALENDAR);
    if (status === 'granted') {
      return true
    } else {
      return false
    }
  }
  if (firstRun && Platform.OS === "ios") {
    setFirstRun(false)
    checkPermission().then((allowed) => {
      if (!allowed) {
        return askPermission()
      } else {
        return true
      }
    }).then((r) => {
      if (r) {
        console.log("Collecting titles of existing calendars to see whether the new calendar already exists")
        return getCalendars().then(calendars => {
          const calendarTitles = []
          let sourceId
          let TD2Id
          calendars.forEach(c => {
            calendarTitles.push(c.title)
            if (c.source.name === "Default" && c.source.type === "local") {
              sourceId = c.source.id
            }
            if (c.title === "TD2") {
              TD2Id = c.id
            }
          })
          // Create calendar if not already existing
          if (calendarTitles.includes("TD2")) {
            console.log("New calendar existed")
            return TD2Id
          } else {
            console.log("Creating new calendar")
            return createTD2Calendar(sourceId)
          }
        })
      } else {
        return null
      }
    }).then(cid => {
      if (cid) {
        console.log("Creating event in calendar with id", cid)
        return Calendar.createEventAsync(cid, {
          startDate: new Date(),
        })
      }
    }).catch(e => {
      console.log(e)
    })
  }
  return null
}
