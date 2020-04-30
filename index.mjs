import net from 'net';
import { exec } from 'child_process';

console.log('Starting connection...');

const MINDWAVE_PORT = 13854;

let previousMindwaveData = {};

const client = net.createConnection({ port: MINDWAVE_PORT }, () => {
  console.log('Connected to Mindwave!');

  const data = {
    appName: "Brainwave BlinkTDD",
    appKey: "9f54141b4b4c567c558d3a76cb8d715cbde03096"
  };
  client.write(JSON.stringify(data));

  const config = {
    enableRawOutput: true,
    format: "Json"
  };
  client.write(JSON.stringify(config));

  client.on('data', (data) => {
    const parsedJson = JSON.parse(data.toString());

    console.log("Logging data:");
    console.log(JSON.stringify(parsedJson, null, 2));

    const hasTwoBlinks = parsedJson.hasOwnProperty('blinkStrength') &&
      previousMindwaveData.hasOwnProperty('blinkStrength');

    if (hasTwoBlinks) {
      console.log("2 blinks detected! Let's run some tests =>");

      exec("jest", (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
      });
    }

    previousMindwaveData = parsedJson;
  });

  client.on('error', (err) => console.log(err));
});
