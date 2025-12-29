const getCookie = (name: string) => {
  var match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  if (match) {
    return match[2];
  }

  return null;
};

export default getCookie;
