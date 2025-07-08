import 'webextension-polyfill';
import { weeklyHistoryStorage } from '@extension/storage';

console.log('Background loaded');
console.log("Edit 'chrome-extension/src/background/index.ts' and save to reload.");

const gotWeeklyHistory = async () => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const historyItems = await chrome.history.search({
    text: '',
    startTime: oneWeekAgo.getTime(),
    maxResults: 10000,
  });

  return historyItems;
};

const storeHistory = async () => {
  const weeklyHistory = await gotWeeklyHistory();
  await weeklyHistoryStorage.set(weeklyHistory);
  console.log('Weekly history stored.');
};

chrome.runtime.onInstalled.addListener(async () => {
  storeHistory();
});

chrome.alarms.create('hostoryUpdate', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'hostoryUpdate') storeHistory();
});
