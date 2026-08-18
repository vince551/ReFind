migrate((app) => {
  const devices = app.findCollectionByNameOrId("devices")
  devices.fields.add(new TextField({ name: "ringHandledAt", max: 40 }))
  devices.fields.add(new TextField({ name: "lastCommand", max: 40 }))
  devices.fields.add(new DateField({ name: "lastCommandAt" }))
  devices.fields.add(new DateField({ name: "lastHeartbeat" }))
  app.save(devices)
}, (app) => {
  const devices = app.findCollectionByNameOrId("devices")
  for (const name of ["ringHandledAt", "lastCommand", "lastCommandAt", "lastHeartbeat"]) {
    try { devices.fields.removeByName(name) } catch (_) {}
  }
  app.save(devices)
})
