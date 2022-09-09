import fs from 'fs';
import axios from "axios";
import iCalParser from 'ical.js';
import dotenv from 'dotenv';

dotenv.config();

const { ICAL_BASE_URL, SCIENTIA_INSTITUTION_ID, SCIENTIA_STUDENT_ID } = process.env;

if (!ICAL_BASE_URL || !SCIENTIA_INSTITUTION_ID || !SCIENTIA_STUDENT_ID) {
    throw new Error('Missing environment variables');
}


try {
    console.log('Fetching calendar data...');
    const { data } = await axios.get(`${ICAL_BASE_URL}/${SCIENTIA_INSTITUTION_ID}/${SCIENTIA_STUDENT_ID}/timetable.ics`);

    console.log('Parsing calendar data...');
    const parsed = iCalParser.parse(data);
    console.log('Calendar data parsed');

    const events = parsed[2]

    const formattedEvents = [];

    console.log('Formatting calendar data...');
    for (let i = 1; i < events.length; i++) {
        const event = events[i][1];
        let formattedEvent: Record<string, any> = {};

        for (const row of event) {
            const key = row[0];
            const value = row[3];

            if (key === 'description') {
                const description = String(value)
                    .replace(/\t\t\n/g, "") // Workaround for "Week Pattern" description
                    .replace(/[\t\r]/g, "")
                    .split("\n")
                    .filter(Boolean)

                const descriptionObject: Record<string, string> = {};
                for (const row of description) {
                    const fRow = row.split(/:(.+)/);
                    const key = fRow[0]?.trim().toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
                    const value = fRow[1];
                    if (key && value) {
                        descriptionObject[key] = value;
                    }
                }

                formattedEvent = {
                    ...formattedEvent,
                    rawDescription: value,
                    description: descriptionObject,
                }
                continue;
            }
            formattedEvent[key] = value;
        }
        formattedEvents.push(formattedEvent);
    }
    console.log('Calendar data formatted');

    console.log('Writing calendar data to file...');

    // Check if directory exists
    if (!fs.existsSync('data')) {
        fs.mkdirSync('data');
    }
    fs.writeFileSync('./data/timetable.json', JSON.stringify(formattedEvents, null, 2));
    console.log('Calendar data written to file');
} catch (error) {
    console.error("\n" + error);
}