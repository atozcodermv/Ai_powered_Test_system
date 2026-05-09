export const resolveExamAttemptRoute = (exam) => {
  switch (exam?.examType) {
    case "Descriptive":
      return "/exam/student/descriptive/attempt";
    case "Medium":
    case "Spell":
    case "Pro":
    case "Match":
      return "/exam/student/attemptSpell";
    case "Hard":
    case "Blank":
      return "/exam/student/attemptBlanks";
    case "Easy":
    case "Multiple":
    case "Objective":
    default:
      return "/exam/student/attempt";
  }
};

export const isBrowserSupportedForExam = () => {
  const userAgent = navigator.userAgent || "";
  const vendor = navigator.vendor || "";
  const isEdge = /Edg\//.test(userAgent);
  const isChrome =
    /Chrome\//.test(userAgent) &&
    /Google Inc/i.test(vendor) &&
    !/Edg\//.test(userAgent) &&
    !/OPR\//.test(userAgent);

  if (isEdge) {
    return { supported: true, browserName: "Microsoft Edge" };
  }

  if (isChrome) {
    return { supported: true, browserName: "Google Chrome" };
  }

  return { supported: false, browserName: "Unsupported browser" };
};

