export const setCookie = (name: string, value: string, days?: number) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }

  // In development environment, Secure flag is not needed
  const isProduction = window.location.protocol === "https:";
  const secureFlag = isProduction ? "; Secure" : "";

  document.cookie =
    name +
    "=" +
    (value || "") +
    expires +
    "; path=/; SameSite=Strict" +
    secureFlag;
};

export const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export const eraseCookie = (name: string) => {
  // In development environment, Secure flag is not needed
  const isProduction = window.location.protocol === "https:";
  const secureFlag = isProduction ? "; Secure" : "";

  document.cookie =
    name +
    "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict" +
    secureFlag;
};
