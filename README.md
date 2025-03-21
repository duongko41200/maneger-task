# Project Management Application

A modern task management application built with Next.js, TypeScript, and Tailwind CSS. This application helps teams organize projects, manage tasks, and collaborate effectively.

## Features

- 📋 Project/Board Management
- ✅ Task and Subtask Management
- 👥 Team Collaboration
- 🎨 Visual Organization with Color Coding
- 📅 Date Management
- 💬 Comments and Notes System
- 🔄 Real-time Updates

## Tech Stack

- **Frontend Framework**: Next.js 15.1.0
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Form Handling**: React Hook Form with Zod validation
- **Backend**: JSON Server (for development)
- **Database Integration**: Firebase
- **Additional Libraries**:
  - date-fns for date handling
  - recharts for data visualization
  - sonner for toast notifications
  - next-themes for theme support

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- Yarn or npm package manager

### Installation

1. Clone the repository:

```bash
git clone [repository-url]
cd project-management-app
```

2. Install dependencies:

```bash
yarn install
# or
npm install
```

3. Start the development server:

```bash
yarn dev
# or
npm run dev
```

This will start:

- Next.js development server on http://localhost:3000
- JSON Server on http://localhost:3004

## Project Structure

```
project-management-app/
├── app/                  # Next.js App Router directory
├── components/           # Reusable React components
├── lib/                  # Utility functions and shared code
├── hooks/               # Custom React hooks
├── styles/              # CSS and styling files
├── public/              # Static assets
└── db.json              # Mock database for development
```

## API Endpoints

The JSON Server provides the following endpoints:

- `GET /tasks` - Retrieve all projects and tasks
- `POST /tasks` - Create a new project
- `PUT /tasks/:id` - Update an existing project
- `DELETE /tasks/:id` - Delete a project

## Data Structure

### Project Object

```typescript
{
  id: string;
  title: string;
  color: string;
  tasks: Task[];
}
```

### Task Object

```typescript
{
  id: string;
  name: string;
  owner: string;
  priority: "High" | "Medium" | "Low" | "";
  status: "Not Started" | "In Progress" | "Done" | "";
  startDate: string;
  endDate: string;
  subtasks: Subtask[];
  contentList: Content[];
}
```

## Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build the application
- `yarn start` - Start production server
- `yarn lint` - Run linting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3004
```

## Deployment

### Deploying to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your project to Vercel:
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Select your repository
   - Configure your environment variables
   - Click "Deploy"

### Deploying JSON Server

For production, you'll need to deploy the JSON Server separately:

1. Create a new repository for your API
2. Add the following files:

   ```
   ├── db.json          # Your database file
   ├── package.json     # Dependencies and scripts
   └── server.js        # Server configuration
   ```

3. Configure `server.js`:

   ```javascript
   const jsonServer = require("json-server");
   const server = jsonServer.create();
   const router = jsonServer.router("db.json");
   const middlewares = jsonServer.defaults();
   const port = process.env.PORT || 3004;

   server.use(middlewares);
   server.use(router);
   server.listen(port, () => {
     console.log(`JSON Server is running on port ${port}`);
   });
   ```

4. Deploy to platforms like Heroku, Railway, or DigitalOcean

## Troubleshooting

### Common Issues and Solutions

1. **Installation Issues**

   ```bash
   # If you encounter node-gyp errors
   npm install --global --production windows-build-tools
   # or
   yarn global add windows-build-tools
   ```

2. **JSON Server Connection Issues**

   - Ensure db.json exists in the root directory
   - Check if port 3004 is available
   - Verify the API URL in environment variables

3. **Build Errors**

   ```bash
   # Clear Next.js cache
   rm -rf .next
   # Reinstall dependencies
   rm -rf node_modules
   yarn install
   ```

4. **Firebase Integration Issues**
   - Verify Firebase configuration in environment variables
   - Ensure Firebase project settings match your application
   - Check if the Firebase services you're using are enabled in the Firebase Console

### Development Tips

1. **Hot Reload Not Working**

   - Check if you have multiple instances of the development server running
   - Ensure you're not using a production build
   - Clear your browser cache

2. **Database Updates Not Reflecting**
   - Restart the JSON Server
   - Check the db.json file for valid JSON format
   - Verify API endpoints are being called with correct HTTP methods

## Performance Optimization

1. **Code Splitting**

   - Use dynamic imports for large components
   - Implement lazy loading for images
   - Utilize Next.js automatic code splitting

2. **State Management**
   - Use React Query for server state
   - Implement local storage for persistent data
   - Optimize re-renders with proper memoization

## Security Best Practices

1. **Authentication**

   - Implement proper user authentication flow
   - Use secure session management
   - Store sensitive data in secure storage

2. **Data Protection**
   - Sanitize user inputs
   - Implement proper CORS policies
   - Use HTTPS in production

## Support

For support, please:

1. Check the issues section in the repository
2. Create a new issue with detailed information about your problem
3. Join our community discussions

## Acknowledgments

- Next.js team for the amazing framework
- Radix UI for the component library
- JSON Server team for the mock backend solution
- All contributors who have helped improve this project
