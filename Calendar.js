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
      // alert('Hey! You heve not enabled selected permissions');
    } else {
      console.log("Permissions granted")
      return true
    }
  }
  async function getCalendars () {
    return Calendar.getCalendarsAsync()
    // return await Calendar.getDefaultCalendarAsync()
  }
  async function createTD2Calendar (sourceId) {
    console.log("sourceId: ", sourceId)
    return Calendar.createCalendarAsync({
      "title": "TD2",
      "color": "#1BADF8",
      "entityType": "event",
      "sourceId": sourceId,
    })
  }
  async function askPermission () {
    // permissions returns only for location permissions on iOS and under certain conditions, see Permissions.LOCATION
    const { status } = await Permissions.askAsync(Permissions.CALENDAR);
    if (status === 'granted') {
      return true
      // alert("Permission granted")
    } else {
      return false
      // throw new Error('Permission not granted');
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
        // alert("I have permission")
        return getCalendars().then(calendars => {
          const calendarTitles = []
          let sourceId
          let TD2Id
          calendars.forEach(c => {
            // console.log(c)
            // console.log(c.source.name)
            calendarTitles.push(c.title)
            // Get sourceId
            //if (c.source.name === "Default" && c.source.type === "local") {
            sourceId = c.source.id // Pick random id here
            //}
            if (c.title === "TD2") {
              console.log(c)
              TD2Id = c.id
            }
          })
          if (calendarTitles.includes("TD2")) {
            return TD2Id
          } else {
            return createTD2Calendar(sourceId)
          }
          // alert(JSON.stringify(c))
          // alert(JSON.stringify(c.source.id))
        })
        // return getCalendars()
      } else {
        // alert("I don't have permission")
        return null
      }
    }).then(cid => {
      console.log(cid)
      if (cid) {
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
