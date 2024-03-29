// This file just contains mini functions so I don't repeat myself.


import mainStore from '../redux/mainStore.js';
import { getUser } from './getUser.js'

export function isEmail(testingString) {
  return /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
    .test(testingString);
}

export function parseEmailToName(messageString) {
  const spaceSplit = messageString.split(" ");
  spaceSplit.forEach((item, i) => {
    if (isEmail(item)) {
      if (item == mainStore.getState().app.email) {
        spaceSplit[i] = "You";
      } else {
        spaceSplit[i] = getUser(item).name;
      }
    }
  });
  return spaceSplit.join(" ");
}
