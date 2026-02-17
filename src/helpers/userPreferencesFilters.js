/**
 * Load and save saved filters in the User_Preferences module.
 * One record per user: Preference_Of = user, Saved_Filters = JSON array string.
 * Search by user first; if record exists update it, else create one.
 *
 * If updates do not persist to CRM, verify in Zoho that the module's API name
 * is exactly "User_Preferences" (Setup > Customization > Modules > [your module] > API Name).
 * Some orgs use a generated name like "CustomModule6"; if so, set MODULE to that API name.
 */

const ZOHO = typeof window !== "undefined" ? window.ZOHO : null;
const MODULE = "User_Preferences";
const FIELD_USER = "Preference_Of";
const FIELD_SAVED_FILTERS = "Saved_Filters";
const FIELD_LATEST_FILTER = "Latest_Filter";
const FIELD_NAME = "Name";

const EMPTY_LATEST_FILTER = {
  priorityFilter: [],
  activityTypeFilter: [],
  userFilter: [],
};

/**
 * Load saved filters and latest filter for the current user from User_Preferences (one search).
 * @param {string} userId - Current user id (e.g. loggedInUser.id)
 * @returns {Promise<{ savedFilters: Array, latestFilter: object | null }>}
 */
export function loadUserPreferences(userId) {
  if (!ZOHO?.CRM?.API?.searchRecord || !userId) {
    return Promise.resolve({
      savedFilters: [],
      latestFilter: null,
    });
  }
  return ZOHO.CRM.API.searchRecord({
    Entity: MODULE,
    Type: "criteria",
    Query: `(${FIELD_USER}:equals:${userId})`,
  })
    .then((response) => {
      const records = response?.data ?? response?.details ?? [];
      if (records.length === 0) {
        return { savedFilters: [], latestFilter: null };
      }
      const record = records[0];
      let savedFilters = [];
      try {
        const raw = record[FIELD_SAVED_FILTERS];
        const arr = raw ? JSON.parse(raw) : [];
        savedFilters = Array.isArray(arr) ? arr : [];
      } catch {
        savedFilters = [];
      }
      let latestFilter = null;
      try {
        const raw = record[FIELD_LATEST_FILTER];
        const obj = raw ? JSON.parse(raw) : null;
        if (obj && typeof obj === "object") {
          latestFilter = {
            priorityFilter: Array.isArray(obj.priorityFilter)
              ? obj.priorityFilter
              : [],
            activityTypeFilter: Array.isArray(obj.activityTypeFilter)
              ? obj.activityTypeFilter
              : [],
            userFilter: Array.isArray(obj.userFilter) ? obj.userFilter : [],
          };
        }
      } catch {
        latestFilter = null;
      }
      return { savedFilters, latestFilter };
    })
    .catch(() => ({ savedFilters: [], latestFilter: null }));
}

/**
 * Load saved filters for the current user from User_Preferences.
 * @param {string} userId - Current user id (e.g. loggedInUser.id)
 * @returns {Promise<Array>} Resolves to the array of saved filters (or [] on error/empty).
 */
export function loadSavedFiltersFromUserPreferences(userId) {
  return loadUserPreferences(userId).then(({ savedFilters }) => savedFilters);
}

/**
 * Persist the latest applied filter to the user's User_Preferences record.
 * If no record exists, does nothing (latest filter is only persisted once the user has a record).
 * @param {string} userId - Current user id
 * @param {object} value - { priorityFilter, activityTypeFilter, userFilter }
 * @returns {Promise<void>}
 */
export function persistLatestFilterToUserPreferences(userId, value) {
  if (!ZOHO?.CRM?.API || !userId) {
    return Promise.resolve();
  }
  const valueStr =
    typeof value === "string" ? value : JSON.stringify(value || EMPTY_LATEST_FILTER);
  return ZOHO.CRM.API.searchRecord({
    Entity: MODULE,
    Type: "criteria",
    Query: `(${FIELD_USER}:equals:${userId})`,
  }).then((response) => {
    const records = response?.data ?? response?.details ?? [];
    if (records.length === 0) return;
    const first = records[0];
    const recordId = first?.id ?? first?.Id ?? first?.record_id;
    if (!recordId) return;
    return ZOHO.CRM.API.updateRecord({
      Entity: MODULE,
      RecordID: String(recordId),
      APIData: {
        id: String(recordId),
        [FIELD_LATEST_FILTER]: valueStr,
      },
    });
  });
}

/**
 * Save saved filters for the current user in User_Preferences.
 * If a record for this user exists, update it; otherwise create one. One record per user.
 * @param {Array} filtersArray - Array of filter objects to persist
 * @param {string} userId - Current user id (e.g. loggedInUser.id)
 * @param {string} [userDisplayName] - User's display name for the record Name (e.g. "John Doe - Preference")
 * @returns {Promise<void>}
 */
export function saveFiltersToUserPreferences(filtersArray, userId, userDisplayName) {
  if (!ZOHO?.CRM?.API || !userId) {
    return Promise.reject(new Error("User id required"));
  }
  const value =
    typeof filtersArray === "string"
      ? filtersArray
      : JSON.stringify(filtersArray);
  const recordName = userDisplayName
    ? `${userDisplayName} - Preference`
    : "User - Preference";

  return ZOHO.CRM.API.searchRecord({
    Entity: MODULE,
    Type: "criteria",
    Query: `(${FIELD_USER}:equals:${userId})`,
  })
    .then((response) => {
      const records = response?.data ?? response?.details ?? [];
      if (records.length > 0) {
        const first = records[0];
        const recordId = first.id ?? first.Id ?? first.record_id;
        if (!recordId) {
          return Promise.reject(
            new Error("User preference record has no id")
          );
        }
        return ZOHO.CRM.API.updateRecord({
          Entity: MODULE,
          RecordID: String(recordId),
          APIData: {
            id: String(recordId),
            [FIELD_SAVED_FILTERS]: value,
          },
        }).then((updateResponse) => {
          const code = updateResponse?.data?.[0]?.code;
          if (code && code !== "SUCCESS") {
            const msg =
              updateResponse?.data?.[0]?.details?.message ??
              updateResponse?.data?.[0]?.message ??
              "Update failed";
            return Promise.reject(new Error(msg));
          }
        });
      }
      return ZOHO.CRM.API.insertRecord({
        Entity: MODULE,
        APIData: {
          [FIELD_NAME]: recordName,
          [FIELD_USER]: userId,
          [FIELD_SAVED_FILTERS]: value,
        },
      }).then((insertResponse) => {
        const code = insertResponse?.data?.[0]?.code;
        if (code && code !== "SUCCESS") {
          const msg =
            insertResponse?.data?.[0]?.details?.message ??
            insertResponse?.data?.[0]?.message ??
            "Insert failed";
          return Promise.reject(new Error(msg));
        }
      });
    })
    .catch((err) => {
      const message =
        err?.message ??
        (typeof err?.details === "string" ? err.details : null) ??
        (typeof err === "object" ? JSON.stringify(err) : String(err));
      return Promise.reject(new Error(message || "Failed to save filters"));
    });
}
