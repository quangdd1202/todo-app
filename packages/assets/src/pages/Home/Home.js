import React, {useCallback, useEffect, useState} from 'react';
import {Button, ButtonGroup, Card, Divider, Layout, Page, Text, TextField} from '@shopify/polaris';
import useFetchApi from '@assets/hooks/api/useFetchApi';
import useCreateApi from '@assets/hooks/api/useCreateApi';
import {useStore} from '@assets/reducers/storeReducer';
import {setLoading, setToast} from '@assets/actions/storeActions';
import useDeleteApi from '@assets/hooks/api/useDeleteApi';

/**
 * Render a home page for overview
 *
 * @return {React.ReactElement}
 * @constructor
 */
export default function Home() {
  const {dispatch} = useStore();

  const initQueries = {};
  const [rows, setRows] = useState([]);
  const [editingRowIds, setEditingRowIds] = useState([]);

  const [inputTodo, setInputTodo] = useState('');
  const handleChangeInputTodo = useCallback(newValue => setInputTodo(newValue), []);

  const {fetchApi: reFetchTodos, data: todos, loading: todosIsFetching} = useFetchApi({
    url: '/todos',
    initQueries,
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
      reFetchTodos();
    }
  };

  const {deleting, handleDelete} = useDeleteApi({
    url: '/deleteTodo'
  });

  const handleDeleteTodo = async id => {
    await handleDelete({
      data: {todoDocId: id}
    });

    if (!deleting) {
      console.log('fetch after delete');
      reFetchTodos();
    }
  };

  const handleUpdateEditingRows = targetRowId => {
    setEditingRowIds(prevState => {
      const updatedSet = new Set(prevState);
      if (updatedSet.has(targetRowId)) {
        updatedSet.delete(targetRowId);
      } else {
        updatedSet.add(targetRowId);
      }
      return [...updatedSet];
    });
  };

  useEffect(() => {
    setLoading(dispatch, todosIsFetching || creating || deleting);
  }, [todosIsFetching, creating, deleting]);

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

  return (
    <Page title="Todo">
      {(todosIsFetching || creating || deleting) && (
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

            <TextField
              label="Add item"
              placeholder={'Add item...'}
              value={inputTodo}
              onChange={handleChangeInputTodo}
              autoComplete="off"
              requiredIndicator={true}
              connectedRight={
                <Button onClick={handleCreateTodo} variant={'primary'} size={'large'}>
                  Add
                </Button>
              }
            />

            <br />

            <Divider borderWidth={'050'} borderColor={'border'} />

            <TextField
              label="Search"
              placeholder={'Search...'}
              autoComplete="off"
              connectedRight={
                <Button variant={'primary'} size={'large'}>
                  Search
                </Button>
              }
            />

            <div style={{width: '100%', marginTop: '20px'}}>
              <table style={{width: '100%', fontSize: '1rem', borderCollapse: 'collapse'}}>
                <thead style={{fontSize: '1.6rem'}}>
                  <tr>
                    <th
                      width={'70%'}
                      style={{
                        padding: '8px 0',
                        backgroundColor: '#ccc'
                      }}
                    >
                      Task
                    </th>
                    <th
                      width={'30%'}
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
                        colSpan={2}
                        style={{
                          padding: '4px',
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
                      <td style={{padding: '4px', borderBottom: '1px solid #ccc'}}>
                        {editingRowIds.includes(id) ? (
                          <TextField
                            label={''}
                            value={title}
                            autoComplete={'false'}
                            connectedRight={
                              <Button
                                variant={'primary'}
                                size={'large'}
                                tone={'success'}
                                onClick={() => handleUpdateEditingRows(id)}
                              >
                                Save
                              </Button>
                            }
                          />
                        ) : (
                          title
                        )}
                      </td>
                      <td style={{padding: '4px', borderBottom: '1px solid #ccc'}}>
                        <div style={{display: 'flex', justifyContent: 'center'}}>
                          <ButtonGroup>
                            <Button
                              onClick={() => handleDeleteTodo(id)}
                              variant={'primary'}
                              tone={'critical'}
                            >
                              Delete
                            </Button>
                            <Button
                              variant={editingRowIds.includes(id) ? 'primary' : 'secondary'}
                              onClick={() => handleUpdateEditingRows(id)}
                            >
                              Edit
                            </Button>
                          </ButtonGroup>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
