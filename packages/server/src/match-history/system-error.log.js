const logSystemErrorMessage = (message = 'System Error') => {
  const systemLogMessage =
    message !== 'System Error' ? `System Error: ${message}` : message;

  return `
    <strong class="log-error">
      <em>${systemLogMessage}</em>
    </strong>
  `;
};

export default logSystemErrorMessage;
