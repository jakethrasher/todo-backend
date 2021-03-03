require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;
  
    beforeAll(async done => {
      execSync('npm run setup-db');
  
      client.connect();
  
      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });
      
      token = signInData.body.token; // eslint-disable-line
  
      return done();
    });
  
    afterAll(done => {
      return client.end(done);
    });

    const newTodo = {
      todo: 'pass tests',
      completed: false
    };

    const dbTodo = {
      ...newTodo,
      id: 4,
      owner_id:2
    };
    
    const upDatedTodo = {
      ...dbTodo,
      completed: true
    };

    test('makes a todo', async() => {

      const data = await fakeRequest(app)
        .post('/api/todos')
        .send(newTodo)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);
      
      
      expect(data.body).toEqual(dbTodo);
    });

    test('gets all todos', async() => {

      const data = await fakeRequest(app)
        .get('/api/todos')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);
      
      
      expect(data.body[0]).toEqual(dbTodo);
    });

    test('updates a todo', async() => {

      const data = await fakeRequest(app)
        .put('/api/todos/4')
        .send(upDatedTodo)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);
      
      
      expect(data.body[0]).toEqual(upDatedTodo);
    });
  });
});
   