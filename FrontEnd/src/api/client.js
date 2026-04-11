const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace(/\/$/, "");
  }

  if (typeof window === "undefined") {
    return "";
  }

  if (window.location.port === "3000") {
    return `${window.location.protocol}//${window.location.hostname}:4000`;
  }

  return window.location.origin;
};

const API_BASE_URL = getApiBaseUrl();

const buildUrl = (path) => `${API_BASE_URL}${path}`;

const extractErrorMessage = (data, fallbackMessage) => {
  if (!data) {
    return fallbackMessage;
  }

  if (typeof data.error === "string" && data.error.trim()) {
    return data.error;
  }

  if (typeof data.errors === "string" && data.errors.trim()) {
    return data.errors;
  }

  if (data.error && typeof data.error === "object") {
    const nestedError = Object.values(data.error).find(
      (value) => typeof value === "string" && value.trim()
    );

    if (nestedError) {
      return nestedError;
    }
  }

  if (data.errors && typeof data.errors === "object") {
    const nestedError = Object.values(data.errors).find(
      (value) => typeof value === "string" && value.trim()
    );

    if (nestedError) {
      return nestedError;
    }
  }

  return fallbackMessage;
};

const parseResponse = async (response, path) => {
  const contentType = response.headers.get("content-type") || "";
  const rawText = await response.text();

  if (!rawText) {
    if (!response.ok) {
      throw new Error(`Request failed for ${path} with status ${response.status}`);
    }

    return null;
  }

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Expected JSON from ${path}, but received ${response.status} ${response.statusText}`
    );
  }

  const data = JSON.parse(rawText);

  if (!response.ok) {
    const message = extractErrorMessage(
      data,
      `Request failed for ${path} with status ${response.status}`
    );
    throw new Error(message);
  }

  return data;
};

const requestJson = async (path, options = {}) => {
  const response = await fetch(buildUrl(path), options);
  return parseResponse(response, path);
};

export { API_BASE_URL, requestJson };
