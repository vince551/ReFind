migrate((app) => {
  const devices = new Collection({
    type: "base",
    name: "devices",
    listRule: "owner = @request.auth.id",
    viewRule: "owner = @request.auth.id",
    createRule: "owner = @request.auth.id",
    updateRule: "owner = @request.auth.id",
    deleteRule: "owner = @request.auth.id",
    fields: [
      { name: "owner", type: "relation", required: true, maxSelect: 1, collectionId: "_pb_users_auth_" },
      { name: "deviceId", type: "text", required: true, max: 128 },
      { name: "name", type: "text", required: true, max: 100 },
      { name: "platform", type: "select", values: ["android", "web"], maxSelect: 1 },
      { name: "status", type: "select", values: ["protected", "lost", "offline"], maxSelect: 1 },
      { name: "lastLatitude", type: "number" },
      { name: "lastLongitude", type: "number" },
      { name: "lastAccuracy", type: "number" },
      { name: "battery", type: "number" },
      { name: "lastSeen", type: "date" },
      { name: "ringRequestedAt", type: "date" },
      { name: "lostMessage", type: "text", max: 300 }
    ],
    indexes: ["CREATE UNIQUE INDEX idx_devices_owner_device ON devices (owner, deviceId)"]
  })
  app.save(devices)

  const locations = new Collection({
    type: "base",
    name: "locations",
    listRule: "device.owner = @request.auth.id",
    viewRule: "device.owner = @request.auth.id",
    createRule: "device.owner = @request.auth.id",
    updateRule: null,
    deleteRule: "device.owner = @request.auth.id",
    fields: [
      { name: "device", type: "relation", required: true, maxSelect: 1, collectionId: devices.id, cascadeDelete: true },
      { name: "latitude", type: "number", required: true },
      { name: "longitude", type: "number", required: true },
      { name: "accuracy", type: "number" },
      { name: "battery", type: "number" }
    ],
    indexes: ["CREATE INDEX idx_locations_device_created ON locations (device, created DESC)"]
  })
  app.save(locations)
}, (app) => {
  for (const name of ["locations", "devices"]) {
    try { app.delete(app.findCollectionByNameOrId(name)) } catch (_) {}
  }
})
