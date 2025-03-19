import { PostAddSharp } from "@mui/icons-material";
import React from "react";

interface PaginationProps {
  totalPosts: number;
  postsPerPage: number;
  setCurrentPage: (page: number) => void;
  currentPage: number;
}

const Pagination = ({
  totalPosts,
  postsPerPage,
  setCurrentPage,
  currentPage,
}: PaginationProps) => {
  let pages = [];

  for (let i = 1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center gap-2 mt-4">
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          className={`join-item px-4 py-2 rounded mt-4 ${
            page === currentPage
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-black"
          }`}
        >
          {page}
        </button>
      ))}
    </div>
  );
};

export default Pagination;
