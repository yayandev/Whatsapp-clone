export const formatTimestamp = (timestamp) => {
  if (!timestamp) return "";

  const messageDate = timestamp.toDate();
  const now = new Date();

  // Membuat tanggal hari ini pada jam 00:00:00
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (messageDate >= today) {
    // Jika pesan dikirim hari ini, tampilkan jam
    return messageDate.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    // Jika pesan dikirim sebelum hari ini, tampilkan tanggal
    return messageDate.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
};
