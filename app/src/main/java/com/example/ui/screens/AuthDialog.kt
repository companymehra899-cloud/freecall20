package com.example.ui.screens

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.theme.DarkBorder
import com.example.ui.theme.DarkSurface
import com.example.ui.theme.DarkSurfaceElevated
import com.example.ui.theme.EmeraldAccent
import com.example.ui.theme.EmeraldLight
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.UserProfileChangeRequest

enum class AuthStep {
    LOGIN,
    SIGNUP
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AuthDialog(
    onDismiss: () -> Unit,
    onSubmitAuth: (name: String, email: String, uid: String) -> Unit
) {
    var step by remember { mutableStateOf(AuthStep.LOGIN) }
    var emailInput by remember { mutableStateOf("") }
    var passwordInput by remember { mutableStateOf("") }
    var nameInput by remember { mutableStateOf("") }
    
    var showPassword by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(false) }
    var errorMsg by remember { mutableStateOf("") }
    var successMsg by remember { mutableStateOf("") }
    
    val auth = remember {
        try {
            FirebaseAuth.getInstance()
        } catch (e: Exception) {
            null
        }
    }

    BasicAlertDialog(
        onDismissRequest = onDismiss
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(24.dp))
                .background(DarkSurface)
                .border(1.dp, DarkBorder, RoundedCornerShape(24.dp))
                .padding(22.dp)
        ) {
            val scrollState = rememberScrollState()
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(scrollState)
            ) {
                // Top Header Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (step == AuthStep.LOGIN) "Login with Email" else "Create Account",
                        color = TextPrimary,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )

                    IconButton(onClick = onDismiss, modifier = Modifier.size(28.dp)) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close",
                            tint = TextMuted
                        )
                    }
                }

                Text(
                    text = if (step == AuthStep.LOGIN)
                        "Enter your credentials to access your account"
                    else
                        "Sign up to practice English and track your progress",
                    color = TextSecondary,
                    fontSize = 14.sp,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 4.dp, bottom = 18.dp)
                )

                if (errorMsg.isNotEmpty()) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 14.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFF3B1B1B))
                            .border(1.dp, Color(0xFFEF4444), RoundedCornerShape(12.dp))
                            .padding(12.dp)
                    ) {
                        Text(
                            text = errorMsg,
                            color = Color(0xFFEF4444),
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }

                if (successMsg.isNotEmpty()) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 14.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFF1B3B22))
                            .border(1.dp, Color(0xFF10B981), RoundedCornerShape(12.dp))
                            .padding(12.dp)
                    ) {
                        Text(
                            text = successMsg,
                            color = Color(0xFF10B981),
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }

                AnimatedContent(
                    targetState = step,
                    transitionSpec = { fadeIn() togetherWith fadeOut() },
                    label = "AuthStepTransition"
                ) { currentStep ->
                    Column(modifier = Modifier.fillMaxWidth()) {
                        if (currentStep == AuthStep.SIGNUP) {
                            // Name Input
                            OutlinedTextField(
                                value = nameInput,
                                onValueChange = { 
                                    nameInput = it
                                    errorMsg = ""
                                },
                                label = { Text("Display Name", color = TextMuted, fontSize = 13.sp) },
                                placeholder = { Text("e.g. Harish Singh", color = TextMuted, fontSize = 14.sp) },
                                leadingIcon = {
                                    Icon(Icons.Default.Person, contentDescription = "Name", tint = TextMuted)
                                },
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(imeAction = ImeAction.Next),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = EmeraldAccent,
                                    unfocusedBorderColor = DarkBorder,
                                    focusedTextColor = TextPrimary,
                                    unfocusedTextColor = TextPrimary,
                                    focusedContainerColor = DarkSurfaceElevated,
                                    unfocusedContainerColor = DarkSurfaceElevated
                                ),
                                shape = RoundedCornerShape(14.dp),
                                modifier = Modifier.fillMaxWidth()
                            )
                            Spacer(modifier = Modifier.height(14.dp))
                        }

                        // Email Input
                        OutlinedTextField(
                            value = emailInput,
                            onValueChange = { 
                                emailInput = it
                                errorMsg = ""
                            },
                            label = { Text("Email Address", color = TextMuted, fontSize = 13.sp) },
                            placeholder = { Text("yourname@example.com", color = TextMuted, fontSize = 14.sp) },
                            leadingIcon = {
                                Icon(Icons.Default.Email, contentDescription = "Email", tint = TextMuted)
                            },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(
                                keyboardType = KeyboardType.Email,
                                imeAction = ImeAction.Next
                            ),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = EmeraldAccent,
                                unfocusedBorderColor = DarkBorder,
                                focusedTextColor = TextPrimary,
                                unfocusedTextColor = TextPrimary,
                                focusedContainerColor = DarkSurfaceElevated,
                                unfocusedContainerColor = DarkSurfaceElevated
                            ),
                            shape = RoundedCornerShape(14.dp),
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(modifier = Modifier.height(14.dp))

                        // Password Input
                        OutlinedTextField(
                            value = passwordInput,
                            onValueChange = { 
                                passwordInput = it
                                errorMsg = ""
                            },
                            label = { Text("Password", color = TextMuted, fontSize = 13.sp) },
                            placeholder = { Text("••••••••", color = TextMuted, fontSize = 14.sp) },
                            leadingIcon = {
                                Icon(Icons.Default.Lock, contentDescription = "Password", tint = TextMuted)
                            },
                            trailingIcon = {
                                val image = if (showPassword) Icons.Default.Visibility else Icons.Default.VisibilityOff
                                IconButton(onClick = { showPassword = !showPassword }) {
                                    Icon(image, contentDescription = "Toggle Password", tint = TextMuted)
                                }
                            },
                            visualTransformation = if (showPassword) VisualTransformation.None else PasswordVisualTransformation(),
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(
                                keyboardType = KeyboardType.Password,
                                imeAction = ImeAction.Done
                            ),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = EmeraldAccent,
                                unfocusedBorderColor = DarkBorder,
                                focusedTextColor = TextPrimary,
                                unfocusedTextColor = TextPrimary,
                                focusedContainerColor = DarkSurfaceElevated,
                                unfocusedContainerColor = DarkSurfaceElevated
                            ),
                            shape = RoundedCornerShape(14.dp),
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(modifier = Modifier.height(22.dp))

                        // Submit Button
                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(14.dp))
                                .background(if (isLoading) EmeraldAccent.copy(alpha = 0.5f) else EmeraldAccent)
                                .clickable(enabled = !isLoading) {
                                    val email = emailInput.trim()
                                    val password = passwordInput.trim()
                                    val name = nameInput.trim()

                                    if (email.isEmpty() || password.isEmpty()) {
                                        errorMsg = "Please fill in all fields"
                                        return@clickable
                                    }
                                    if (password.length < 6) {
                                        errorMsg = "Password must be at least 6 characters"
                                        return@clickable
                                    }

                                    isLoading = true
                                    errorMsg = ""
                                    successMsg = ""

                                    if (auth == null) {
                                        // Fallback if Firebase auth service is unavailable
                                        isLoading = false
                                        onSubmitAuth(name.ifEmpty { "English Learner" }, email, email)
                                        onDismiss()
                                        return@clickable
                                    }

                                    if (currentStep == AuthStep.SIGNUP) {
                                        if (name.isEmpty()) {
                                            errorMsg = "Please enter your name"
                                            isLoading = false
                                            return@clickable
                                        }
                                        auth.createUserWithEmailAndPassword(email, password)
                                            .addOnCompleteListener { task ->
                                                if (task.isSuccessful) {
                                                    val user = auth.currentUser
                                                    val profileUpdates = UserProfileChangeRequest.Builder()
                                                        .setDisplayName(name)
                                                        .build()
                                                    user?.updateProfile(profileUpdates)?.addOnCompleteListener {
                                                        isLoading = false
                                                        onSubmitAuth(name, email, email)
                                                        onDismiss()
                                                    } ?: run {
                                                        isLoading = false
                                                        onSubmitAuth(name, email, email)
                                                        onDismiss()
                                                    }
                                                } else {
                                                    isLoading = false
                                                    errorMsg = task.exception?.localizedMessage ?: "Registration failed"
                                                }
                                            }
                                    } else {
                                        auth.signInWithEmailAndPassword(email, password)
                                            .addOnCompleteListener { task ->
                                                if (task.isSuccessful) {
                                                    val user = auth.currentUser
                                                    isLoading = false
                                                    if (user != null) {
                                                        onSubmitAuth(user.displayName ?: "English Learner", user.email ?: email, user.email ?: email)
                                                        onDismiss()
                                                    } else {
                                                        errorMsg = "User not found"
                                                    }
                                                } else {
                                                    isLoading = false
                                                    errorMsg = task.exception?.localizedMessage ?: "Login failed. Please check your email and password."
                                                }
                                            }
                                    }
                                }
                                .padding(vertical = 16.dp)
                        ) {
                            if (isLoading) {
                                CircularProgressIndicator(color = Color.Black, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                            } else {
                                Text(
                                    text = if (currentStep == AuthStep.LOGIN) "Log In" else "Sign Up",
                                    color = Color.Black,
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Switch Step Text
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Text(
                                text = if (currentStep == AuthStep.LOGIN) "New to SpeakFree? " else "Already have an account? ",
                                color = TextMuted,
                                fontSize = 13.sp
                            )
                            Text(
                                text = if (currentStep == AuthStep.LOGIN) "Sign Up" else "Log In",
                                color = EmeraldLight,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.clickable {
                                    step = if (currentStep == AuthStep.LOGIN) AuthStep.SIGNUP else AuthStep.LOGIN
                                    errorMsg = ""
                                    successMsg = ""
                                }
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Guest option
                Text(
                    text = "Continue as Guest without login",
                    color = TextMuted,
                    fontSize = 13.sp,
                    modifier = Modifier
                        .clickable { onDismiss() }
                        .padding(vertical = 6.dp)
                )
            }
        }
    }
}
