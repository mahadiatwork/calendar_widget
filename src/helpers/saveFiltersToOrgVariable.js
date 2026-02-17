const ZOHO = typeof window !== "undefined" ? window.ZOHO : null;
const ORG_VARIABLE_API_NAME = "saved_filters";

/**
 * Loads the saved filters array from the Zoho CRM organization variable "saved_filters".
 * @returns {Promise<Array>} Resolves to the array of saved filters (or [] on error/empty).
 */
export function loadSavedFiltersFromOrgVariable() {
  if (!ZOHO?.CRM?.API?.getOrgVariable) {
    return Promise.resolve([]);
  }
  return ZOHO.CRM.API.getOrgVariable(ORG_VARIABLE_API_NAME)
    .then((data) => {
      const raw = data?.Success?.Content;
      try {
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr : [];
      } catch {
        return [];
      }
    })
    .catch(() => []);
}

/**
 * Saves the saved filters array to the Zoho CRM organization variable "saved_filters" only.
 * Same style as recent_colors: store a compact JSON array string (e.g. [{"name":"...","priorityFilter":[],...}]).
 * @param {Array} filtersArray - Array of filter objects to persist
 * @returns {Promise<void>}
 */
export function saveFiltersToOrgVariable(filtersArray) {
  // TODO: revert to saved_filters after testing - saving to recent_colors to verify save path works
  const apiName = "recent_colors";
  const value =
    typeof filtersArray === "string"
      ? filtersArray
      : JSON.stringify(filtersArray);
  // Direct key-value structure; do not stringify the entire arguments object
  const req_data = {
    api_name: apiName,
    value,
  };
  console.log("[saveFiltersToOrgVariable] req_data (direct structure):", req_data);

  if (typeof ZOHO?.CRM?.API?.setOrgVariable === "function") {
    return ZOHO.CRM.API.setOrgVariable(apiName, value).catch((err) => {
      console.warn("Failed to persist setOrgVariable", err);
      throw err;
    });
  }

  if (typeof ZOHO?.CRM?.CONNECTOR?.execute === "function") {
    const connectorName = "update_org_variable";
    return ZOHO.CRM.CONNECTOR.execute(connectorName, req_data).catch((err) => {
      console.warn("Failed to persist via CONNECTOR", err);
      throw err;
    });
  }

  if (typeof ZOHO?.CRM?.FUNCTIONS?.execute === "function") {
    return ZOHO.CRM.FUNCTIONS.execute("SetOrgVariable", req_data).catch(
      (err) => {
        console.warn("Failed to persist via FUNCTIONS", err);
        throw err;
      }
    );
  }

  return Promise.resolve();
}
