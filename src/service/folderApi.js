// folder.js — Mock + 실제 서버 버전 통합

const USE_MOCK = false;   // mock 사용 시 true, 실제 서버 연동 시 false

const BASE_URL = "http://localhost:8080";

// -----------------------------
// 실제 서버 API 영역 (Real)

import { useAuthStore } from "../store/auth/authStore";

function getAuthHeaders() {
  const { accessToken } = useAuthStore.getState();
  return {
    "Authorization": `Bearer ${accessToken}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
}

// 폴더 목록 (Real)
async function realFetchFolders() {
  const res = await fetch(`${BASE_URL}/category`, {
    method: "GET",
    headers: getAuthHeaders(),
    // credentials: "include", // 필요 시 사용 (JWT 헤더 방식이면 보통 생략 가능하나, CORS 설정에 따라 다름)
  });

  if (!res.ok) throw new Error("Failed to fetch folders");

  return res.json();
}

// 폴더 추가 (Real)
async function realCreateFolder(name) {
  const formData = new URLSearchParams();
  formData.append("name", name);

  const res = await fetch(`${BASE_URL}/category`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to create folder");

  return res.json(); // { id, name }
}

// 폴더 수정 (Real)
async function realUpdateFolder(id, name) {
  const formData = new URLSearchParams();
  formData.append("name", name);

  const res = await fetch(`${BASE_URL}/category/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to update folder");

  return res.json();
}

// 폴더 삭제 (Real)
async function realDeleteFolderById(id) {
  const res = await fetch(`${BASE_URL}/category/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
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


// -----------------------------
// MOCK 데이터 영역

let mockFolders = [
  { id: 1, name: "수업" },
  { id: 2, name: "동아리" },
  { id: 3, name: "인턴" },
];

// 폴더 목록 불러오기 (MOCK)
async function mockFetchFolders() {
  return Promise.resolve([...mockFolders]);
}

// 폴더 추가 (MOCK)
async function mockCreateFolder(newName) {
  const maxId = mockFolders.length > 0
    ? Math.max(...mockFolders.map(f => f.id))
    : 0;

  const newFolder = { id: maxId + 1, name: newName };
  mockFolders = [newFolder, ...mockFolders];

  return Promise.resolve(newFolder); // { id, name }
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

