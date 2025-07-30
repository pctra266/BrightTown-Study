export const responseHandler = (response: any) => {
    try {
        if (response.status <= 299 && response.status >= 200 ) {
            return response;
        } else if (response.status === 500) {
            throw new Error("Internal server error");
        } else {
            throw new Error(response.data.message);
        }
    } catch (err) {
        if (err instanceof Error) {
            throw new Error(err.message);
        } else {
            throw new Error("Something went wrong");
        }
    }
}