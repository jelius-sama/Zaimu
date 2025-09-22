package schedules

const InitTables string = `
	CREATE TABLE IF NOT EXISTS schedules (
		id INT AUTOINCREMENT,
		season TEXT NOT NULL,
		
	)
`
