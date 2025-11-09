let mockFolders = [
  { id: crypto.randomUUID(), name: "수업" },
  { id: crypto.randomUUID(), name: "동아리" },
  { id: crypto.randomUUID(), name: "인턴" },
];

// 폴더 목록 불러오기
export async function fetchFolders() {
  // 실제 서버라면 axios.get('/folders')
  return Promise.resolve([...mockFolders]); // shallow copy
}

// 폴더 추가
export async function createFolder(newName) {
  const newFolder = { id: crypto.randomUUID(), name: newName };
  mockFolders = [newFolder, ...mockFolders];
  return Promise.resolve(newFolder);
}

// 폴더 이름 수정
export async function updateFolder(id, newName) {
  mockFolders = mockFolders.map(folder =>
    folder.id === id ? { ...folder, name: newName } : folder
  );
  const updated = mockFolders.find(f => f.id === id);
  return Promise.resolve(updated);
}

// 폴더 삭제
export async function deleteFolderById(id) {
  mockFolders = mockFolders.filter(folder => folder.id !== id);
  return Promise.resolve(true);
}
