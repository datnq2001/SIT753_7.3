const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { config } = require('../config/env').init();

/**
 * Survey Service - Handles all database operations for surveys
 */
class SurveyService {
  constructor() {
    this.dbPath = config.database.path;
    this.db = null;
  }

  /**
   * Initialize database connection
   */
  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('❌ Database connection error:', err.message);
          reject(err);
        } else {
          console.log('✅ Connected to SQLite database');
          this.initializeTables().then(resolve).catch(reject);
        }
      });
    });
  }

  /**
   * Get database instance, connect if needed
   */
  async getDatabase() {
    if (!this.db) {
      await this.connect();
    }
    return this.db;
  }

  /**
   * Initialize database tables
   */
  async initializeTables() {
    return new Promise((resolve, reject) => {
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS surveys (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          firstname TEXT NOT NULL,
          surname TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          address TEXT NOT NULL,
          suburb TEXT NOT NULL,
          postcode TEXT NOT NULL,
          phone TEXT NOT NULL,
          q1radio TEXT NOT NULL,
          q2radio TEXT NOT NULL,
          q3radio TEXT NOT NULL,
          comments TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      this.db.run(createTableSQL, (err) => {
        if (err) {
          console.error('❌ Error creating surveys table:', err.message);
          reject(err);
        } else {
          console.log('✅ Surveys table initialized');
          resolve();
        }
      });
    });
  }

  /**
   * Create a new survey
   * @param {Object} surveyData - Survey data
   * @returns {Promise<Object>} Created survey with ID
   */
  async createSurvey(surveyData) {
    try {
      await this.getDatabase();
      return new Promise((resolve, reject) => {
        const {
          firstname, surname, email, address, suburb, postcode,
          phone, q1radio, q2radio, q3radio, comments
        } = surveyData;

        const sql = `
          INSERT INTO surveys (
            firstname, surname, email, address, suburb, postcode,
            phone, q1radio, q2radio, q3radio, comments
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
          firstname, surname, email, address, suburb, postcode,
          phone, q1radio, q2radio, q3radio, comments
        ];

        this.db.run(sql, params, function(err) {
          if (err) {
            if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
              reject(new Error('Email already exists'));
            } else {
              reject(err);
            }
          } else {
            resolve({
              id: this.lastID,
              ...surveyData,
              created_at: new Date().toISOString()
            });
          }
        });
      });
    } catch (error) {
      console.error('Error in createSurvey:', error);
      throw error;
    }
  }

  /**
   * Get all surveys
   * @returns {Promise<Array>} List of surveys
   */
  async getAllSurveys() {
    try {
      await this.getDatabase();
      return new Promise((resolve, reject) => {
        this.db.all(
          `SELECT id, firstname, surname, email, address, suburb, postcode, phone, 
           q1radio, q2radio, q3radio, comments, created_at 
           FROM surveys ORDER BY created_at DESC`,
          [],
          (err, rows) => {
            if (err) {
              console.error('Error fetching surveys:', err);
              reject(err);
            } else {
              resolve(rows);
            }
          }
        );
      });
    } catch (error) {
      console.error('Error in getAllSurveys:', error);
      throw error;
    }
  }

  async getSurveysWithPagination({ page = 1, limit = 10, sortBy = 'created_at', order = 'desc' }) {
    try {
      await this.getDatabase();
      const offset = (page - 1) * limit;
      
      // Validate sortBy field to prevent SQL injection
      const allowedSortFields = ['id', 'created_at', 'firstname', 'surname', 'email'];
      const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
      const validOrder = ['asc', 'desc'].includes(order.toLowerCase()) ? order.toUpperCase() : 'DESC';
      
      // Get total count
      const totalCount = await new Promise((resolve, reject) => {
        this.db.get('SELECT COUNT(*) as total FROM surveys', [], (err, row) => {
          if (err) reject(err);
          else resolve(row.total);
        });
      });
      
      // Get paginated surveys
      const surveys = await new Promise((resolve, reject) => {
        this.db.all(
          `SELECT id, firstname, surname, email, address, suburb, postcode, phone, 
           q1radio, q2radio, q3radio, comments, created_at 
           FROM surveys 
           ORDER BY ${validSortBy} ${validOrder}
           LIMIT ? OFFSET ?`,
          [limit, offset],
          (err, rows) => {
            if (err) {
              console.error('Error fetching paginated surveys:', err);
              reject(err);
            } else {
              resolve(rows);
            }
          }
        );
      });
      
      return {
        surveys,
        total: totalCount
      };
    } catch (error) {
      console.error('Error in getSurveysWithPagination:', error);
      throw error;
    }
  }

  /**
   * Get survey by ID
   * @param {number} id - Survey ID
   * @returns {Promise<Object|null>} Survey or null if not found
   */
  async getSurveyById(id) {
    try {
      await this.getDatabase();
      return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM surveys WHERE id = ?';
        
        this.db.get(sql, [id], (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        });
      });
    } catch (error) {
      console.error('Error in getSurveyById:', error);
      throw error;
    }
  }

  /**
   * Update survey by ID
   * @param {number} id - Survey ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated survey or null if not found
   */
  async updateSurvey(id, updateData) {
    try {
      await this.getDatabase();
      return new Promise((resolve, reject) => {
        const allowedFields = [
          'firstname', 'surname', 'email', 'address', 'suburb', 'postcode',
          'phone', 'q1radio', 'q2radio', 'q3radio', 'comments'
        ];

        const fieldsToUpdate = Object.keys(updateData).filter(key => 
          allowedFields.includes(key)
        );

        if (fieldsToUpdate.length === 0) {
          reject(new Error('No valid fields to update'));
          return;
        }

        const setClause = fieldsToUpdate.map(field => `${field} = ?`).join(', ');
        const values = fieldsToUpdate.map(field => updateData[field]);
        values.push(new Date().toISOString(), id);

        const sql = `
          UPDATE surveys 
          SET ${setClause}, updated_at = ?
          WHERE id = ?
        `;

        this.db.run(sql, values, function(err) {
          if (err) {
            if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
              reject(new Error('Email already exists'));
            } else {
              reject(err);
            }
          } else if (this.changes === 0) {
            resolve(null); // No rows updated
          } else {
            // Return updated survey
            resolve({ id: parseInt(id), ...updateData, updated_at: new Date().toISOString() });
          }
        });
      });
    } catch (error) {
      console.error('Error in updateSurvey:', error);
      throw error;
    }
  }

  /**
   * Delete survey by ID
   * @param {number} id - Survey ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteSurvey(id) {
    try {
      await this.getDatabase();
      return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM surveys WHERE id = ?';
      
        this.db.run(sql, [id], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes > 0);
          }
        });
      });
    } catch (error) {
      console.error('Error in deleteSurvey:', error);
      throw error;
    }
  }

  /**
   * Get survey statistics
   * @returns {Promise<Object>} Statistics
   */
  async getSurveyStats() {
    try {
      await this.getDatabase();
      return new Promise((resolve, reject) => {
        const queries = {
          total: 'SELECT COUNT(*) as count FROM surveys',
          avgRating: `
            SELECT 
              ROUND(AVG(CAST(q1radio as FLOAT)), 2) as q1_avg,
              ROUND(AVG(CAST(q2radio as FLOAT)), 2) as q2_avg,
              ROUND(AVG(CAST(q3radio as FLOAT)), 2) as q3_avg
            FROM surveys
          `,
          recentCount: `
            SELECT COUNT(*) as count 
            FROM surveys 
            WHERE created_at >= datetime('now', '-30 days')
          `
        };

        const results = {};
        let completed = 0;
        const total = Object.keys(queries).length;

        Object.entries(queries).forEach(([key, sql]) => {
          this.db.get(sql, (err, row) => {
            if (err) {
              reject(err);
              return;
            }

            results[key] = row;
            completed++;

            if (completed === total) {
              resolve({
                totalSurveys: results.total.count,
                averageRatings: {
                  question1: results.avgRating.q1_avg,
                  question2: results.avgRating.q2_avg,
                  question3: results.avgRating.q3_avg
                },
                recentSurveys: results.recentCount.count
              });
            }
          });
        });
      });
    } catch (error) {
      console.error('Error in getSurveyStats:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('❌ Error closing database:', err.message);
        } else {
          console.log('✅ Database connection closed');
        }
      });
    }
  }
}

// Create and export a singleton instance
const surveyService = new SurveyService();
module.exports = surveyService;