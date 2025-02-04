import React, {useCallback, useEffect, useState} from 'react';
import {
  Button,
  ButtonGroup,
  Card,
  Divider,
  Form,
  Layout,
  Page,
  Pagination,
  Text,
  TextField
} from '@shopify/polaris';
import useFetchApi from '@assets/hooks/api/useFetchApi';
import useCreateApi from '@assets/hooks/api/useCreateApi';
import {useStore} from '@assets/reducers/storeReducer';
import {setLoading, setToast} from '@assets/actions/storeActions';
import useDeleteApi from '@assets/hooks/api/useDeleteApi';
import useEditApi from '@assets/hooks/api/useEditApi';

/**
 * Render a home page for overview
 *
 * @return {React.ReactElement}
 * @constructor
 */
export default function Home() {
  const {dispatch} = useStore();

  const initQueryParams = {
    page: 1,
    limit: '2',
    hasCount: true
  };

  const [queryParams, setQueryParams] = useState({});

  useEffect(() => {
    setQueryParams(initQueryParams);
  }, []);

  const [searchTerm, setSearchTerm] = useState('');

  const updateQueryParams = async modifiedValues => {
    const {page = 1, search = searchTerm} = modifiedValues;
    await reFetchTodos(null, {...queryParams, ...modifiedValues});

    setQueryParams({...queryParams, page, search});
  };

  const [rows, setRows] = useState([]);
  const [editingRows, setEditingRows] = useState(new Map());

  const [inputTodo, setInputTodo] = useState('');
  const handleChangeInputTodo = useCallback(newValue => setInputTodo(newValue), []);

  const {fetchApi: reFetchTodos, data: todos, pageInfo, loading: todosIsFetching} = useFetchApi({
    url: '/todos',
    initQueries: initQueryParams,
    initLoad: true
  });

  const {creating, handleCreate} = useCreateApi({
    url: '/createTodo',
    successMsg: 'New todo created',
    errorMsg: 'Failed to create new todo'
  });

  const handleCreateTodo = async () => {
    if (!inputTodo.length) {
      setToast(dispatch, 'Please fill all required fields', true);
      return;
    }

    const todoCreatedSuccess = await handleCreate({
      title: inputTodo
    });

    if (todoCreatedSuccess) {
      setInputTodo('');
    }

    if (!creating) {
      console.log('fetch after create new');
      reFetchTodos(null, queryParams);
    }
  };

  const {deleting, handleDelete} = useDeleteApi({
    url: '/deleteTodo'
  });

  const handleDeleteTodo = async targetRowId => {
    await handleDelete({
      data: {todoDocId: targetRowId}
    });

    if (!deleting) {
      handleUpdateEditingRows(targetRowId, true);
      console.log('fetch after delete');
      reFetchTodos(null, queryParams);
    }
  };

  const handleUpdateEditingRows = (targetRowId, afterDelete = false) => {
    setEditingRows(prevState => {
      const newMap = new Map(prevState);

      if (newMap.has(targetRowId) || afterDelete) {
        newMap.delete(targetRowId);
      } else {
        const rowData = rows.find(row => row.id === targetRowId);
        newMap.set(targetRowId, rowData);
      }

      return newMap;
    });
  };

  const handleChangeEditingRowInput = (targetRowId, value) => {
    setEditingRows(prevState => {
      const newMap = new Map(prevState);
      const rowData = prevState.get(targetRowId);

      newMap.set(targetRowId, {...rowData, title: value});

      return newMap;
    });
  };

  const {editing, handleEdit} = useEditApi({
    url: '/editTodo',
    useToast: true,
    successMsg: 'Todo updated',
    errorMsg: 'Failed to update todo'
  });

  const handleSaveEditingRow = async targetRowId => {
    const editingRowData = editingRows.get(targetRowId);

    const editTodoSuccess = await handleEdit(editingRowData);

    if (editTodoSuccess) {
      handleUpdateEditingRows(targetRowId);
    }

    if (!editing) {
      console.log('fetch after edit');
      reFetchTodos(null, queryParams);
    }
  };

  useEffect(() => {
    setLoading(dispatch, todosIsFetching || creating || deleting || editing);
  }, [todosIsFetching, creating, deleting, editing]);

  useEffect(() => {
    setRows(
      todos.map(todo => {
        return {
          id: todo.id,
          title: todo.title
        };
      })
    );
  }, [todos]);

  const [searchTermInput, setSearchTermInput] = useState('');
  const handleChangeSearchTermInput = useCallback(newValue => setSearchTermInput(newValue), []);

  const handleSearchTodos = async () => {
    await updateQueryParams({search: searchTermInput});

    setSearchTerm(searchTermInput);
    setSearchTermInput('');
  };

  return (
    <Page title="Todo">
      {(todosIsFetching || creating || deleting || editing) && (
        <div
          className={`loading-overlay`}
          style={{
            position: 'absolute',
            zIndex: 999,
            inset: 0,
            backgroundColor: '#ccc',
            opacity: 0.3
          }}
        ></div>
      )}
      <Layout>
        <Layout.Section>
          <Card>
            <Text as="h1" fontWeight={'bold'} variant={'heading2xl'} alignment={'center'}>
              TODO LIST
            </Text>

            <br />

            <Divider borderWidth={'050'} borderColor={'border'} />

            <br />

            <TextField
              label="Add item"
              labelHidden
              placeholder={'Add item...'}
              value={inputTodo}
              onChange={handleChangeInputTodo}
              autoComplete="off"
              requiredIndicator={true}
              connectedRight={
                <div style={{width: '100px'}}>
                  <Button onClick={handleCreateTodo} variant={'primary'} size={'large'}>
                    Add
                  </Button>
                </div>
              }
            />

            <br />

            <Divider borderWidth={'050'} borderColor={'border'} />

            <br />

            <Form onSubmit={handleSearchTodos} preventDefault>
              <TextField
                label="Search"
                labelHidden
                value={searchTermInput}
                onChange={handleChangeSearchTermInput}
                placeholder={'Search...'}
                autoComplete={'on'}
                connectedRight={
                  <div style={{width: '100px'}}>
                    <Button variant={'primary'} size={'large'} tone={'success'} submit={true}>
                      Search
                    </Button>
                  </div>
                }
              />
            </Form>

            <br />

            {searchTerm && (
              <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                <span>
                  Search results for: <b>{searchTerm}</b>
                </span>
                <Button
                  variant={'primary'}
                  size={'micro'}
                  onClick={() => {
                    setSearchTerm('');
                    reFetchTodos(null, initQueryParams);
                  }}
                >
                  Clear
                </Button>
              </div>
            )}

            <div style={{width: '100%', marginTop: '20px'}}>
              <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead style={{fontSize: '1.2rem'}}>
                  <tr>
                    <th
                      style={{
                        padding: '8px 0',
                        backgroundColor: '#ccc'
                      }}
                    >
                      ID
                    </th>
                    <th
                      style={{
                        padding: '8px 0',
                        backgroundColor: '#ccc'
                      }}
                    >
                      Title
                    </th>
                    <th
                      width={'200px'}
                      style={{
                        padding: '8px 0',
                        backgroundColor: '#ccc'
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        style={{
                          height: '50px',
                          padding: '8px',
                          textAlign: 'center',
                          borderBottom: '1px solid #ccc'
                        }}
                      >
                        No data available
                      </td>
                    </tr>
                  )}
                  {rows.map(({id, title}) => (
                    <tr key={id}>
                      <td
                        style={{
                          height: '50px',
                          width: '200px',
                          textAlign: 'center',
                          padding: '8px',
                          borderBottom: '1px solid #ccc'
                        }}
                      >
                        {id}
                      </td>
                      <td style={{height: '50px', padding: '8px', borderBottom: '1px solid #ccc'}}>
                        {editingRows.has(id) ? (
                          <Form onSubmit={() => handleSaveEditingRow(id)} preventDefault>
                            <TextField
                              label={''}
                              value={editingRows.get(id).title}
                              onChange={value => handleChangeEditingRowInput(id, value)}
                              autoComplete={'false'}
                              connectedRight={
                                <Button
                                  variant={'primary'}
                                  size={'large'}
                                  tone={'success'}
                                  submit={true}
                                >
                                  Save
                                </Button>
                              }
                            />
                          </Form>
                        ) : (
                          title
                        )}
                      </td>
                      <td style={{height: '50px', padding: '8px', borderBottom: '1px solid #ccc'}}>
                        <div style={{display: 'flex', justifyContent: 'center'}}>
                          <ButtonGroup>
                            <Button
                              variant={editingRows.has(id) ? 'primary' : 'secondary'}
                              onClick={() => handleUpdateEditingRows(id)}
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDeleteTodo(id)}
                              variant={'primary'}
                              tone={'critical'}
                            >
                              Delete
                            </Button>
                          </ButtonGroup>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td
                      colSpan={3}
                      style={{height: '50px', padding: '8px', borderBottom: '1px solid #ccc'}}
                    >
                      <div
                        style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}
                      >
                        <Pagination
                          hasPrevious={pageInfo.hasPre}
                          onPrevious={async () => {
                            await updateQueryParams({
                              before: rows[0].id,
                              page: queryParams.page - 1
                            });
                          }}
                          hasNext={pageInfo.hasNext}
                          onNext={async () => {
                            await updateQueryParams({
                              after: rows[rows.length - 1].id,
                              page: queryParams.page + 1
                            });
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
