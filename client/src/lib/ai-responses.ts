import type { ChatMessage } from "@/components/chat-interface";

// Generate AI response using RAG or direct LLM
export const generateAIResponse = async (userMessage: string, useRAG: boolean = true): Promise<ChatMessage> => {
  try {
    // Call the appropriate endpoint based on user preference
    const endpoint = useRAG ? '/api/rag/generate' : '/api/llm/generate';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        query: userMessage,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate AI response');
    }

    const data = await response.json();
    
    // Process the response to extract code exercises and video suggestions
    const lowerResponse = data.response.toLowerCase();
    let metadata: any = {};

    // Extract video suggestions based on response content and user query
    const lowerQuery = userMessage.toLowerCase();
    const videoSuggestions = [];
    
    if (lowerResponse.includes('devops') || lowerQuery.includes('devops')) {
      videoSuggestions.push('DevOps fundamentals', 'CI/CD pipeline tutorial', 'Docker and Kubernetes basics');
    } else if (lowerResponse.includes('javascript') || lowerResponse.includes('array') || lowerQuery.includes('javascript')) {
      videoSuggestions.push('JavaScript arrays tutorial', 'JavaScript array methods map filter reduce', 'JavaScript array manipulation examples');
    } else if (lowerResponse.includes('python') || lowerResponse.includes('loop') || lowerQuery.includes('python')) {
      videoSuggestions.push('Python loops tutorial', 'Python for beginners', 'Python iteration methods');
    } else if (lowerResponse.includes('react') || lowerResponse.includes('component') || lowerQuery.includes('react')) {
      videoSuggestions.push('React components tutorial', 'React hooks explained', 'React state management');
    } else if (lowerResponse.includes('node') || lowerResponse.includes('express') || lowerQuery.includes('node')) {
      videoSuggestions.push('Node.js tutorial', 'Express.js crash course', 'Building REST APIs');
    } else if (lowerResponse.includes('docker') || lowerQuery.includes('docker')) {
      videoSuggestions.push('Docker tutorial', 'Containerization basics', 'Docker compose guide');
    } else if (lowerResponse.includes('kubernetes') || lowerQuery.includes('kubernetes')) {
      videoSuggestions.push('Kubernetes basics', 'K8s deployment tutorial', 'Container orchestration');
    } else if (lowerResponse.includes('aws') || lowerQuery.includes('aws')) {
      videoSuggestions.push('AWS fundamentals', 'Cloud computing basics', 'AWS services overview');
    } else {
      // Always provide relevant programming video suggestions based on query
      if (lowerQuery.includes('programming') || lowerQuery.includes('code')) {
        videoSuggestions.push('Programming fundamentals', 'Code best practices', 'Software development tutorials');
      } else {
        // Use the user's query as video suggestions
        videoSuggestions.push(`${userMessage} tutorial`, `learn ${userMessage}`, `${userMessage} explained`);
      }
    }

    // Generate code exercise based on content
    if (lowerResponse.includes('javascript') || lowerResponse.includes('array')) {
      metadata.codeExercise = {
        language: "javascript",
        title: "Practice JavaScript Array Methods",
        code: `// TODO: Complete the array manipulation functions

function addFruit(fruits, newFruit) {
  // Add newFruit to the end of the array
  return fruits;
}

function removeDuplicates(arr) {
  // Remove duplicate elements
  return arr;
}

function findLargest(numbers) {
  // Find the largest number in the array
  return 0;
}

// Test your functions
console.log(addFruit(['apple', 'banana'], 'orange'));
console.log(removeDuplicates([1, 2, 2, 3, 3, 4]));
console.log(findLargest([3, 7, 1, 9, 2]));`,
        testCases: [
          "addFruit(['apple', 'banana'], 'orange') → ['apple', 'banana', 'orange']",
          "removeDuplicates([1, 2, 2, 3, 3, 4]) → [1, 2, 3, 4]",
          "findLargest([3, 7, 1, 9, 2]) → 9"
        ]
      };
    } else if (lowerResponse.includes('python') || lowerResponse.includes('loop')) {
      metadata.codeExercise = {
        language: "python",
        title: "Python Loops and Iterations",
        code: `# TODO: Complete the loop-based functions

def print_numbers(n):
    """Print numbers from 1 to n"""
    pass

def sum_even_numbers(numbers):
    """Calculate sum of even numbers in the list"""
    total = 0
    # Your code here
    return total

def create_multiplication_table(n):
    """Create multiplication table for number n"""
    table = []
    # Your code here
    return table

# Test your functions
print_numbers(5)
print(sum_even_numbers([1, 2, 3, 4, 5, 6]))
print(create_multiplication_table(3))`,
        testCases: [
          "print_numbers(5) should print 1, 2, 3, 4, 5",
          "sum_even_numbers([1, 2, 3, 4, 5, 6]) → 12",
          "create_multiplication_table(3) → [3, 6, 9]"
        ]
      };
    }

    metadata.videoSuggestions = videoSuggestions;

    return {
      id: `ai-${Date.now()}`,
      role: "assistant",
      content: data.response,
      metadata,
      timestamp: new Date()
    };

  } catch (error) {
    console.error('Error generating AI response:', error);
    // Fallback to local response generation
    return generateLocalResponse(userMessage);
  }
};

// Fallback local response generation
const generateLocalResponse = (userMessage: string): ChatMessage => {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes("array") || lowerMessage.includes("javascript")) {
    return {
      id: `ai-${Date.now()}`,
      role: "assistant",
      content: `Great question! JavaScript arrays are fundamental data structures. Let me show you some common array methods with examples:

\`\`\`javascript
// Creating arrays
const fruits = ['apple', 'banana', 'orange'];
const numbers = [1, 2, 3, 4, 5];

// Common array methods
fruits.push('grape'); // Add to end
fruits.pop(); // Remove from end
fruits.unshift('mango'); // Add to beginning
fruits.shift(); // Remove from beginning

// Iterating arrays
numbers.forEach(num => console.log(num));
const doubled = numbers.map(num => num * 2);
const evens = numbers.filter(num => num % 2 === 0);
\`\`\`

I've prepared a coding exercise for you to practice these concepts. Check the IDE panel on the right!`,
      metadata: {
        codeExercise: {
          language: "javascript",
          title: "Practice JavaScript Array Methods",
          code: `// TODO: Complete the array manipulation functions

function addFruit(fruits, newFruit) {
  // Add newFruit to the end of the array
  return fruits;
}

function removeDuplicates(arr) {
  // Remove duplicate elements
  return arr;
}

function findLargest(numbers) {
  // Find the largest number in the array
  return 0;
}

// Test your functions
console.log(addFruit(['apple', 'banana'], 'orange'));
console.log(removeDuplicates([1, 2, 2, 3, 3, 4]));
console.log(findLargest([3, 7, 1, 9, 2]));`,
          testCases: [
            "addFruit(['apple', 'banana'], 'orange') → ['apple', 'banana', 'orange']",
            "removeDuplicates([1, 2, 2, 3, 3, 4]) → [1, 2, 3, 4]",
            "findLargest([3, 7, 1, 9, 2]) → 9"
          ]
        },
        videoSuggestions: [
          "JavaScript arrays tutorial",
          "JavaScript array methods map filter reduce",
          "JavaScript array manipulation examples"
        ]
      },
      timestamp: new Date()
    };
  }
  
  if (lowerMessage.includes("python") || lowerMessage.includes("loop")) {
    return {
      id: `ai-${Date.now()}`,
      role: "assistant",
      content: `Python loops are essential for iteration! Let me show you the different types of loops and their use cases:

\`\`\`python
# For loops - iterate over sequences
fruits = ['apple', 'banana', 'orange']
for fruit in fruits:
    print(f"I like {fruit}")

# Range-based loops
for i in range(5):
    print(f"Number: {i}")

# While loops - continue until condition is false
count = 0
while count < 3:
    print(f"Count: {count}")
    count += 1

# List comprehensions - elegant way to create lists
squares = [x**2 for x in range(10)]
even_squares = [x**2 for x in range(10) if x % 2 == 0]
\`\`\`

Try implementing these concepts in the exercise I've prepared for you!`,
      metadata: {
        codeExercise: {
          language: "python",
          title: "Python Loops and Iterations",
          code: `# TODO: Complete the loop-based functions

def print_numbers(n):
    """Print numbers from 1 to n"""
    pass

def sum_even_numbers(numbers):
    """Calculate sum of even numbers in the list"""
    total = 0
    # Your code here
    return total

def create_multiplication_table(n):
    """Create multiplication table for number n"""
    table = []
    # Your code here
    return table

# Test your functions
print_numbers(5)
print(sum_even_numbers([1, 2, 3, 4, 5, 6]))
print(create_multiplication_table(3))`,
          testCases: [
            "print_numbers(5) → prints 1, 2, 3, 4, 5",
            "sum_even_numbers([1, 2, 3, 4, 5, 6]) → 12",
            "create_multiplication_table(3) → ['3x1=3', '3x2=6', '3x3=9']"
          ]
        },
        videoSuggestions: [
          "Python for loops tutorial",
          "Python while loops explained",
          "Python list comprehensions guide"
        ]
      },
      timestamp: new Date()
    };
  }

  // Default response
  return {
    id: `ai-${Date.now()}`,
    role: "assistant", 
    content: `I'd be happy to help you learn programming! I can assist with:

• Programming concepts and syntax
• Algorithm explanations
• Code debugging and optimization
• Best practices and design patterns
• Coding exercises and challenges

What specific topic would you like to explore? For example, you could ask about:
- JavaScript arrays and objects
- Python loops and functions  
- Data structures and algorithms
- Web development concepts
- Or any other programming topic!`,
    metadata: {
      videoSuggestions: [
        "programming fundamentals tutorial",
        "coding best practices",
        "beginner programming concepts"
      ]
    },
    timestamp: new Date()
  };
};