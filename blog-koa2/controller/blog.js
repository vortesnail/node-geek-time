const { exec, escape } = require('../db/mysql');
const xss = require('xss');

const getList = async (author, keyword) => {
  author = escape(author);
  // where 1=1 是为了防止 author 和 keyword 都为空情况下 sql 不报错
  let sql = 'select * from blogs where 1=1 ';
  if (author && author !== '\'\'') {
    sql += `and author=${author} `;
  }
  if (keyword) {
    sql += `and title like '%${keyword}%'`;
  }
  sql += 'order by createTime desc';

  // 返回 promise
  return await exec(sql);
};

const getDetail = async (id) => {
  id = escape(id);
  const sql = `select * from blogs where id=${id}`;
  const rows = await exec(sql);
  return rows[0];
};

const newBlog = async (blogData = {}) => {
  // blogData 是一个博客对象，包含 title、content 等
  const title = escape(xss(blogData.title));
  const content = escape(blogData.content);
  const author = escape(blogData.author);
  const createTime = Date.now();

  const sql = `
    insert into blogs (title, content, author, createTime)
    values (${title}, ${content}, ${author}, '${createTime}');
  `;

  const insertData = await exec(sql);
  return {
    id: insertData.insertId
  };
};

const updateBlog = async (id, blogData = {}) => {
  // id 为当前需要更新的博客 id
  // blogData 是一个博客对象，包含 title、content 等
  const title = escape(xss(blogData.title));
  const content = escape(blogData.content);

  const sql = `
    update blogs set title=${title}, content=${content} where id=${id};
  `;

  const updateData = await exec(sql);
  if (updateData.affectedRows > 0) {
    return true;
  }
  return false;
};

const delBlog = async (id, author) => {
  id = escape(id);
  author = escape(author);
  // id 就是要删除博客的 id
  const sql = `
    delete from blogs where id=${id} and author=${author};
  `;

  const deleteData = await exec(sql);
  if (deleteData.affectedRows > 0) {
    return true;
  }
  return false;
};

module.exports = {
  getList,
  getDetail,
  newBlog,
  updateBlog,
  delBlog
};
