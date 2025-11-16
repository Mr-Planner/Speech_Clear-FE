// folder.js — Mock + 실제 서버 버전 통합

const USE_MOCK = true;   // mock 사용 시 true, 실제 서버 연동 시 false

// todo 실제 서버 URL로 변경 
const BASE_URL = "https://your-api.com";

// -----------------------------
// MOCK 데이터 영역

let mockFolders = [
  { id: crypto.randomUUID(), name: "수업" },
  { id: crypto.randomUUID(), name: "동아리" },
  { id: crypto.randomUUID(), name: "인턴" },
];

// 폴더 목록 불러오기 (MOCK)
async function mockFetchFolders() {
  return Promise.resolve([...mockFolders]);
}

// 폴더 추가 (MOCK)
async function mockCreateFolder(newName) {
  const newFolder = { id: crypto.randomUUID(), name: newName };
  mockFolders = [newFolder, ...mockFolders];
  return Promise.resolve(newFolder);
}

// 폴더 수정 (MOCK)
async function mockUpdateFolder(id, newName) {
  mockFolders = mockFolders.map(f =>
    f.id === id ? { ...f, name: newName } : f
  );
  return Promise.resolve(mockFolders.find(f => f.id === id));
}

// 폴더 삭제 (MOCK)
async function mockDeleteFolderById(id) {
  mockFolders = mockFolders.filter(f => f.id !== id);
  return Promise.resolve(true);
}

// -----------------------------
// 실제 서버 API 영역 (Real)

// 폴더 목록 (Real)
async function realFetchFolders() {
  const res = await fetch(`${BASE_URL}/folders`, {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch folders");

  return res.json();
}

// 폴더 추가 (Real)
async function realCreateFolder(name) {
  const res = await fetch(`${BASE_URL}/folders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name }),
  });

  if (!res.ok) throw new Error("Failed to create folder");

  return res.json(); // { id, name }
}

// 폴더 수정 (Real)
async function realUpdateFolder(id, name) {
  const res = await fetch(`${BASE_URL}/folders/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name }),
  });

  if (!res.ok) throw new Error("Failed to update folder");

  return res.json();
}

// 폴더 삭제 (Real)
async function realDeleteFolderById(id) {
  const res = await fetch(`${BASE_URL}/folders/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to delete folder");

  return true;
}

// -----------------------------
// 최종 export (Mock / Real 선택)

export const fetchFolders = USE_MOCK ? mockFetchFolders : realFetchFolders;
export const createFolder = USE_MOCK ? mockCreateFolder : realCreateFolder;
export const updateFolder = USE_MOCK ? mockUpdateFolder : realUpdateFolder;
export const deleteFolderById = USE_MOCK ? mockDeleteFolderById : realDeleteFolderById;
