import 'webextension-polyfill';
import { getDomainName, humanizeDuration } from '@extension/shared';
import {
  goalsStorage,
  dailyUsageStorage,
  notificationLogStorage,
  weeklyHistoryStorage,
  allowListStorage,
} from '@extension/storage';

// --- Constants ---
const USAGE_CHECK_ALARM = 'usageChecker';
const DAILY_RESET_ALARM = 'dailyReset';
const HISTORY_UPDATE_ALARM = 'historyUpdate';
const USAGE_CHECK_INTERVAL_MIN = 1;

// --- Main Functions ---

/**
 * Checks the active tab, updates usage time, and triggers notifications if goals are exceeded.
 */
const checkUsageAndNotify = async () => {
  const [activeTabs, goals, usage, notifications, allowList] = await Promise.all([
    chrome.tabs.query({ active: true, currentWindow: true }),
    goalsStorage.get(),
    dailyUsageStorage.get(),
    notificationLogStorage.get(),
    allowListStorage.get(),
  ]);

  if (activeTabs.length === 0 || !activeTabs[0].url) return;

  const activeTab = activeTabs[0];
  if (!activeTab.url?.startsWith('http')) return;

  const domain = getDomainName(activeTab.url);
  if (allowList.includes(domain)) return;
  const goal = goals.find(g => g.domainName === domain);

  // If there's no goal for this site, no need to track it
  if (!goal) return;

  // Update time spent for the current domain
  const newUsage = { ...usage };
  const timeSpent = (newUsage[domain] || 0) + USAGE_CHECK_INTERVAL_MIN * 60 * 1000;
  newUsage[domain] = timeSpent;
  await dailyUsageStorage.set(newUsage);

  // Check if goal is exceeded and if we haven't notified today
  const hasNotifiedToday = hasBeenNotifiedToday(notifications, domain);

  if (timeSpent >= goal.limit && !hasNotifiedToday) {
    // Send Notification
    await chrome.notifications.create(`goalExceeded_${domain}`, {
      type: 'basic',
      iconUrl: 'icon-128.png',
      title: 'Time Limit Reached!',
      message: `You've spent over ${humanizeDuration(goal.limit)} on ${domain} today. Time for a break?`,
    });

    // Log that we've sent the notification
    const newNotifications = { ...notifications, [domain]: Date.now() };
    await notificationLogStorage.set(newNotifications);
  }
};

/**
 * Resets the daily tracking storage.
 */
const resetDailyStats = async () => {
  console.log('Resetting daily usage and notification logs.');
  await dailyUsageStorage.set({});
  await notificationLogStorage.set({});
};

/**
 * Fetches the latest history from the browser and updates the storage.
 */
const updateWeeklyHistory = async () => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const historyItems = await chrome.history.search({
    text: '',
    startTime: oneWeekAgo.getTime(),
    maxResults: 10000,
  });

  await weeklyHistoryStorage.set(historyItems);
};

// --- Helper Functions ---

const hasBeenNotifiedToday = (log: Record<string, number>, domain: string): boolean => {
  const lastNotificationTime = log[domain];
  if (!lastNotificationTime) return false;

  const today = new Date().setHours(0, 0, 0, 0);
  const lastNotificationDay = new Date(lastNotificationTime).setHours(0, 0, 0, 0);

  return today === lastNotificationDay;
};

// --- Alarm Listeners & Setup ---

chrome.runtime.onInstalled.addListener(() => {
  // Setup all alarms on installation
  chrome.alarms.create(USAGE_CHECK_ALARM, { periodInMinutes: USAGE_CHECK_INTERVAL_MIN });
  chrome.alarms.create(DAILY_RESET_ALARM, { periodInMinutes: 60 }); // Check every hour for a new day
  chrome.alarms.create(HISTORY_UPDATE_ALARM, { periodInMinutes: 10 });

  // Initial data fetch
  updateWeeklyHistory();
  resetDailyStats();
});

chrome.alarms.onAlarm.addListener(async alarm => {
  if (alarm.name === USAGE_CHECK_ALARM) await checkUsageAndNotify();
  if (alarm.name === HISTORY_UPDATE_ALARM) await updateWeeklyHistory();

  if (alarm.name === DAILY_RESET_ALARM) {
    // A simple way to check if it's a new day
    const lastReset = (await dailyUsageStorage.get())['lastReset'] || 0;
    const today = new Date().setHours(0, 0, 0, 0);
    if (lastReset < today) {
      await resetDailyStats();
      // Mark the reset time
      await dailyUsageStorage.set(current => ({ ...current, lastReset: Date.now() }));
    }
  }
});
