const customFetch = async (url: string, options: RequestInit): Promise<Response> => {
	const response = await fetch(url, options);

	if (response.status === 401) {
		try {
			const refreshTokenResponse = await fetch('https://QuizBack-env.eba-42wfp9gq.eu-central-1.elasticbeanstalk.com/api/Auth/refreshToken', {
				method: 'POST',
				credentials: 'include',
			});
			if (refreshTokenResponse.ok) {
				return fetch(url, options);
			} else {
				window.location.href = '/landing';
				console.error('Token refresh failed');
				return response;
			}
		} catch (refreshError) {
				window.location.href = '/landing';
				console.error('Token refresh failed with message :', (refreshError as Error).message);
				throw refreshError;
		}
	}
	return response;
};
export default customFetch;
