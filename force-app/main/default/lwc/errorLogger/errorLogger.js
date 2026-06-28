import logFromLwc from '@salesforce/apex/ErrorLogService.logFromLwc';

const logError = (sourceName, message, stackTrace) => {
    logFromLwc({ sourceName, message: String(message), stackTrace: stackTrace || '' })
        .catch(err => {
            console.error('errorLogger: failed to log error', err);
        });
};

export { logError };
