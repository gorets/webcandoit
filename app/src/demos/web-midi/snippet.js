const access = await navigator.requestMIDIAccess({ sysex: false });

// List connected devices.
for (const input of access.inputs.values()) {
  console.log('Input:', input.name);
}

// Listen for incoming MIDI messages.
for (const input of access.inputs.values()) {
  input.onmidimessage = (event) => {
    const [status, data1, data2] = event.data;
    console.log('MIDI:', status.toString(16), data1, data2);
  };
}
