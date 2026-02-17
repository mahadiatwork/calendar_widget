# Zoho Custom Function: SetOrgVariable

The calendar widget saves filters only to Zoho organization variables (`saved_filters`, `latest_filter`). The client SDK does not expose `setOrgVariable`, so the widget calls a **Custom Function** to write the value from the server.

## Create the function in Zoho CRM

1. In Zoho CRM go to **Setup** → **Automation** → **Functions** (or **Developer Space** → **Functions**).
2. Create a new **Standalone Function**.
3. Set the **Function Name** to exactly: **SetOrgVariable**
4. Add one **argument**: `arguments` (string) – JSON with keys `api_name` and `value`.
5. Use the following Deluge script.

### Deluge script

The widget sends `arguments` as a JSON string: `{"api_name":"saved_filters","value":"[...]"}`. The **value** is a compact JSON array string (same style as **recent_colors**, e.g. `["#f74b8f","#9900ff"]` or for filters `[{"name":"My Filter","priorityFilter":[],...}]`). The connector `crm.set` expects a map with key **apiname** (no underscore) and **value**. Read `api_name` from the widget and pass it as **apiname** to the connector.

```deluge
params = arguments.toMap();   // or getJson(arguments) depending on your Zoho Deluge version
variable_api_name = params.get("api_name");   // e.g. "saved_filters"
value = params.get("value");
valueMap = Map();
valueMap.put("apiname", variable_api_name);   // connector expects key "apiname"
valueMap.put("value", value);
return zoho.crm.invokeConnector("crm.set", valueMap);
```

6. Ensure the **crm.set** connector task exists and is allowed to set organization variables (Setup → Developer Space → Connectors).
7. Save and publish the function.

## Org variables

Create two organization variables in **Setup** → **Developer Hub** → **Variables** (or **Custom Variables**):

| Variable Name | API Name       | Type     |
|---------------|----------------|----------|
| Saved Filters | saved_filters  | Multi-Line |
| Latest Filter | latest_filter  | Multi-Line |

The widget reads and writes only these two org variables; no data is stored in the browser.
