export default {
  async rewrites() {
    return [
      {
        source: '/videos/:filename',
        destination: '/api/videos/:filename',
      },
    ];
  },
};
