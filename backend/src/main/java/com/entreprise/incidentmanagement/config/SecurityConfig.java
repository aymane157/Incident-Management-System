package com.entreprise.incidentmanagement.config;

import com.entreprise.incidentmanagement.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()));
        http
                .csrf(csrf -> csrf.disable())
                .formLogin(form -> form.disable())
                .httpBasic(httpBasic -> httpBasic.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/auth/login", "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/incidents/FindNewIncident/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/attachments/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/users").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/users/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/users/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/users/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/users/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/teams/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/teams/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/teams/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/teams/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/applications/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/applications/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/applications/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/applications/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/incidents/client").hasRole("CLIENT")
                        .requestMatchers(HttpMethod.POST, "/incidents/*/claim/*").hasAnyRole("INCIDENT_MANAGER", "RESPONSABLE_TRAITEMENT", "MEMBRE_EQUIPE", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/incidents/*/rejectIncidentWithReason").hasAnyRole("INCIDENT_MANAGER", "RESPONSABLE_TRAITEMENT", "MEMBRE_EQUIPE", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/incidents/*/rejectIncidentByManager").hasAnyRole("INCIDENT_MANAGER", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/incidents/*/reviewIncidentRejection").hasAnyRole("INCIDENT_MANAGER", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/incidents/*/reopenRejectedIncident/*").hasAnyRole("INCIDENT_MANAGER", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/incidents/**").hasAnyRole("CLIENT", "INCIDENT_MANAGER", "RESPONSABLE_TRAITEMENT", "MEMBRE_EQUIPE", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/incidents/**").hasAnyRole("INCIDENT_MANAGER", "RESPONSABLE_TRAITEMENT", "MEMBRE_EQUIPE", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/incidents/**").hasAnyRole("INCIDENT_MANAGER", "RESPONSABLE_TRAITEMENT", "MEMBRE_EQUIPE", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/rca-reports/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/rca-reports/*/client-rejection").hasRole("CLIENT")
                        .requestMatchers(HttpMethod.POST, "/rca-reports/**").hasAnyRole("INCIDENT_MANAGER", "RESPONSABLE_TRAITEMENT", "MEMBRE_EQUIPE", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/rca-reports/**").hasAnyRole("INCIDENT_MANAGER", "RESPONSABLE_TRAITEMENT", "MEMBRE_EQUIPE", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/rca-reports/**").hasAnyRole("INCIDENT_MANAGER", "RESPONSABLE_TRAITEMENT", "MEMBRE_EQUIPE", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/notifications/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/notifications/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/notifications/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/notifications/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

