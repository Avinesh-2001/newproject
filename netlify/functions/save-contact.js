let submissions = [];

exports.handler = async (event) => {
    if (event.httpMethod === 'POST') {
        try {
            const { fullName, email, company, industry, message } = JSON.parse(event.body);
            
            const sanitize = (str) => {
                if (typeof str !== 'string') return '';
                return str.replace(/"/g, '""').replace(/,/g, '');
            };

            const submission = {
                timestamp: new Date().toISOString(),
                fullName: sanitize(fullName),
                email: sanitize(email),
                company: sanitize(company),
                industry: sanitize(industry),
                message: sanitize(message)
            };

            submissions.push(submission);

            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Submission saved' })
            };
        } catch (error) {
            console.error('Error saving submission:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to save submission' })
            };
        }
    } else if (event.httpMethod === 'GET' && event.path.includes('/download-contacts')) {
        try {
            const headers = ['Timestamp', 'Full Name', 'Email', 'Company', 'Industry', 'Message'];
            const csvRows = [
                headers.map(h => `"${h}"`).join(','),
                ...submissions.map(s => [
                    `"${s.timestamp}"`,
                    `"${s.fullName}"`,
                    `"${s.email}"`,
                    `"${s.company}"`,
                    `"${s.industry}"`,
                    `"${s.message}"`
                ].join(','))
            ];

            const csvContent = csvRows.join('\n');

            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': 'attachment; filename="contacts.csv"'
                },
                body: csvContent
            };
        } catch (error) {
            console.error('Error generating CSV:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to generate CSV' })
            };
        }
    }

    return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' })
    };
};