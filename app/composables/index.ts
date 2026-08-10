export const getResponse = () => {
  const getUserResponse = async () => {
    try {
      return await $fetch("/api/user");
    } catch (err) {
      console.error((err as Error)?.message);
      return null;
    }
  };

  const getAIResponse = async (input: string) => {
    try {
      const { data } = await $fetch("/api/ai", {
        method: "POST",
        body: { input },
      });
      return data;
    } catch (err) {
      console.error((err as Error)?.message);
      return null;
    }
  };

  const getModelListResponse = async () => {
    try {
      const { data } = await $fetch("/api/ai", {
        method: "GET",
      });
      return data;
    } catch (err) {
      console.error((err as Error)?.message);
      return null;
    }
  };

  return {
    getUserResponse,
    getAIResponse,
    getModelListResponse,
  };
};
