import React, { useEffect, useState } from "react";
import "./Pagination.scss";
import { ChevronRight, ChevronLeft } from "react-bootstrap-icons";

interface PaginationProps {
  totalItems?: number;
  itemsCountPerPage?: number;
  className?: string;
  changePage: any;
  changeCurrentPage?:any;
}

const Pagination = (props: PaginationProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(0);
  const [pages, setPages] = useState<Number[]>([]);


useEffect(()=>{
  setCurrentPage(props.changeCurrentPage)
},[props.changeCurrentPage])




  useEffect(() => {
    var totalItems: number = props.totalItems ? props.totalItems : Number(10);
    var itemsCountPerPage: number = props.itemsCountPerPage
      ? props.itemsCountPerPage
      : Number(10);
    const totalPage = Math.ceil(totalItems / itemsCountPerPage);
    setLastPage(totalPage);
    var temp = [];
    let startPage, endPage;
    if (totalPage <= 5) {
      startPage = 1;
      endPage = totalPage;
    } else {
      if (currentPage <= 3) {
        startPage = 1;
        endPage = 5;
      } else if (currentPage + 2 >= totalPage) {
        startPage = totalPage - 4;
        endPage = totalPage;
      } else {
        startPage = currentPage - 2;
        endPage = currentPage + 2;
      }
    }
    for (let i = startPage; i <= endPage; i++) {
      temp.push(i);
    }
    setPages(temp);
  }, [currentPage, props.totalItems]);

  const changepage = (page: number) => {
    setCurrentPage(page);
    props.changePage(page);
  };

  const nextchangepage = () => {
    setCurrentPage(currentPage == lastPage ? lastPage : currentPage + 1);
    props.changePage(currentPage);
  };
  const previouschangepage = () => {
    setCurrentPage(currentPage == 1 ? currentPage : currentPage - 1);
    props.changePage(currentPage);
  };

  return (
    <>
      <div className={"pagination " + (props.className ? props.className : "")}>
        <div className="arrow-box" onClick={() => previouschangepage()}>
          <ChevronLeft
            className={
              currentPage != 1 ? "pagination-icon p-active" : "pagination-icon"
            }
          />
        </div>

        {pages.map((page: any, index: number) => {
          return (
            <div key={"pagable_" + index} className="count-box cursor-pointer">
              <div
                className={
                  page === currentPage
                    ? "pagination-count active"
                    : "pagination-count"
                }
                onClick={() => changepage(page)}
              >
                {page}
              </div>
            </div>
          );
        })}
        <div className="arrow-box" onClick={() => nextchangepage()}>
          <ChevronRight
            className={
              currentPage == lastPage
                ? "pagination-icon "
                : "pagination-icon p-active"
            }
          />
        </div>
      </div>
    </>
  );
};

export default Pagination;
