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
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const maxVisibleButtons = 5;

  const handlePageClick = (page: number) => {
    setCurrentPage(page); // ✅ Update page immediately
    window.scrollTo(0, 0); // ✅ Instantly reposition to top
  };

  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    if (startPage > 1) pages.push(1);
    if (startPage > 2) pages.push("...");

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) pages.push("...");
    if (endPage < totalPages) pages.push(totalPages);

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        onClick={() => currentPage > 1 && handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"}`}
      >
        {"< Previous"}
      </button>

      {getPageNumbers().map((page, index) =>
        typeof page === "number" ? (
          <button
            key={index}
            onClick={() => handlePageClick(page)}
            className={`px-4 py-2 rounded ${page === currentPage ? "bg-blue-500 text-black" : "bg-gray-200 hover:bg-gray-300"}`}
          >
            {page}
          </button>
        ) : (
          <span key={index} className="px-3 py-2">
            {page}
          </span>
        )
      )}

      <button
        onClick={() => currentPage < totalPages && handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"}`}
      >
        {"Next >"}
      </button>
    </div>
  );
};

export default Pagination;